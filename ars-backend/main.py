import os
import json
import sqlite3
import logging
import math
import re
from collections import Counter
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import Depends, status
from jose import JWTError, jwt
import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------
# Env + xAI/Grok Client
# -----------------------------
load_dotenv()

XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    raise RuntimeError("XAI_API_KEY missing in environment; set it in .env or export it")

client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.groq.com/openai/v1")
logger.info("Loaded XAI_API_KEY successfully")

import random
import time
import re

def llm_call_backend(messages: list, model: str = "llama-3.1-8b-instant", max_tokens: int = 1200, temperature: float = 0.5):
    max_retries = 6
    delays = [1, 2, 5, 10, 15, 30] 
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model=model, messages=messages, max_tokens=max_tokens, temperature=temperature
            )
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "rate_limit" in err_msg.lower():
                match = re.search(r"try again in (\d+\.?\d*)s", err_msg.lower())
                wait_time = float(match.group(1)) + 0.5 if match else delays[min(attempt, 5)] + random.uniform(0.5, 2.0)
                if attempt < max_retries - 1:
                    time.sleep(wait_time)
                    continue
            raise
    return client.chat.completions.create(model=model, messages=messages, max_tokens=max_tokens, temperature=temperature)

# -----------------------------
# Security & JWT Utils
# -----------------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-fallback-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = None # Removed passlib
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, email FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    
    if user is None:
        raise credentials_exception
    return {"id": user[0], "email": user[1]}


DB_PATH = os.path.join(os.path.dirname(__file__), "docs.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn


def init_db():
    """Initialize SQLite database with chunks table"""
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            doc_name TEXT NOT NULL,
            chunk_text TEXT NOT NULL,
            chunk_index INTEGER NOT NULL,
            embedding TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            is_google_auth BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    try:
        c.execute("ALTER TABLE users ADD COLUMN full_name TEXT")
    except sqlite3.OperationalError:
        pass  # Column already exists
    conn.commit()
    conn.close()


# -----------------------------
# Simple TF-IDF Embedding (no external API needed)
# -----------------------------
def tokenize(text: str) -> List[str]:
    """Simple tokenizer: lowercase, split on non-alphanumeric"""
    return re.findall(r'[a-z0-9]+', text.lower())


def compute_tf(tokens: List[str]) -> dict:
    """Compute term frequency"""
    counter = Counter(tokens)
    total = len(tokens)
    if total == 0:
        return {}
    return {word: count / total for word, count in counter.items()}


def simple_embedding(text: str) -> List[float]:
    """
    Create a simple bag-of-words style embedding.
    Uses a fixed vocabulary hash to map tokens to a fixed-size vector.
    """
    tokens = tokenize(text)
    tf = compute_tf(tokens)
    
    # Use a fixed-size vector (256 dimensions)
    vec_size = 256
    vector = [0.0] * vec_size
    
    for word, freq in tf.items():
        # Hash word to a position in the vector
        idx = hash(word) % vec_size
        vector[idx] += freq
    
    # L2 normalize
    norm = math.sqrt(sum(v * v for v in vector))
    if norm > 0:
        vector = [v / norm for v in vector]
    
    return vector


def get_embedding(text: str) -> str:
    """Get embedding for text using simple local method"""
    try:
        embedding = simple_embedding(text)
        return json.dumps(embedding)
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise


# -----------------------------
# Chunking
# -----------------------------
def simple_chunk(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Simple chunking by character count with overlap"""
    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end == len(text):
            break

        start = end - overlap

    return chunks


def store_chunks(doc_name: str, chunks: List[str]):
    """Store chunks and embeddings in SQLite"""
    conn = get_db_connection()
    c = conn.cursor()

    for idx, chunk in enumerate(chunks):
        try:
            embedding = get_embedding(chunk)
            c.execute(
                """
                INSERT INTO chunks (doc_name, chunk_text, chunk_index, embedding)
                VALUES (?, ?, ?, ?)
                """,
                (doc_name, chunk, idx, embedding)
            )
        except Exception as e:
            logger.error(f"Failed to embed chunk {idx} of {doc_name}: {e}")

    conn.commit()
    conn.close()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two vectors"""
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))

    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot / (norm1 * norm2)


def retrieve_chunks(query: str, top_k: int = 5) -> List[dict]:
    """Retrieve top-k chunks by similarity to query"""
    try:
        query_embedding = json.loads(get_embedding(query))

        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id, doc_name, chunk_text, embedding FROM chunks")
        all_chunks = c.fetchall()
        conn.close()

        scored = []
        for chunk_id, doc_name, chunk_text, embedding_text in all_chunks:
            chunk_embedding = json.loads(embedding_text)
            score = cosine_similarity(query_embedding, chunk_embedding)

            scored.append({
                "chunk_id": chunk_id,
                "doc_name": doc_name,
                "text": chunk_text,
                "score": score
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        raise


# -----------------------------
# App Init
# -----------------------------
init_db()

app = FastAPI(title="ARS Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# -----------------------------
# Request Models
# -----------------------------
class RetrievalRequest(BaseModel):
    query: str
    top_k: int = 5


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None


class ResearchTopicRequest(BaseModel):
    topic: str
    mode: str = "full"


class ExperimentModeRequest(BaseModel):
    problem_statement: str
    domain: str = "AI"

class ExperimentSuggestion(BaseModel):
    approach: str
    approach_description: str
    dataset: str
    dataset_url: str
    expected_output: str
    difficulty: str
    estimated_time: str

class ExperimentAnalysisRequest(BaseModel):
    problem_statement: str
    suggestion: ExperimentSuggestion
    domain: str = "AI"

class UserRegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class UserLoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    token: str


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def health():
    return {"status": "ok", "app": "ARS Backend"}


# -----------------------------
# Auth Routes
# -----------------------------
@app.post("/api/auth/register")
def register(user: UserRegisterRequest):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (user.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    c.execute(
        "INSERT INTO users (full_name, email, password_hash, is_google_auth) VALUES (?, ?, ?, ?)",
        (user.full_name, user.email, hashed_pw, False)
    )
    conn.commit()
    conn.close()
    return {"success": True, "message": "User created successfully"}

@app.post("/api/auth/login")
def login(user: UserLoginRequest):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, password_hash, is_google_auth FROM users WHERE email = ?", (user.email,))
    db_user = c.fetchone()
    conn.close()
    
    if not db_user or db_user[2] or not verify_password(user.password, db_user[1]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"email": user.email, "id": db_user[0]}}

@app.post("/api/auth/google")
def google_auth(req: GoogleAuthRequest):
    try:
        # Note: in a real production environment, pass `client_id=YOUR_CLIENT_ID` to verify_oauth2_token
        idinfo = id_token.verify_oauth2_token(req.token, requests.Request())
        email = idinfo.get('email')
        if not email:
            raise ValueError("No email in token")
            
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT id FROM users WHERE email = ?", (email,))
        db_user = c.fetchone()
        
        if not db_user:
            c.execute(
                "INSERT INTO users (email, is_google_auth) VALUES (?, ?)",
                (email, True)
            )
            conn.commit()
            user_id = c.lastrowid
        else:
            user_id = db_user[0]
            
        conn.close()
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user": {"email": email, "id": user_id}}
        
    except ValueError as e:
        logger.error(f"Google auth error: {e}")
        raise HTTPException(status_code=400, detail="Invalid Google token")


@app.post("/api/docs/upload")
async def upload_doc(file: UploadFile = File(...)):
    """Upload and process a document"""
    try:
        content = await file.read()
        text = content.decode("utf-8")

        chunks = simple_chunk(text)
        store_chunks(file.filename, chunks)

        logger.info(f"Uploaded {file.filename}: {len(chunks)} chunks")
        return {
            "success": True,
            "file": file.filename,
            "chunks": len(chunks)
        }

    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/docs/retrieve")
def retrieve(req: RetrievalRequest):
    """Retrieve top-k chunks for a query"""
    try:
        chunks = retrieve_chunks(req.query, req.top_k)
        return {
            "success": True,
            "query": req.query,
            "chunks": chunks
        }

    except Exception as e:
        logger.error(f"Retrieval route error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
def chat(req: ChatRequest):
    """General chat endpoint using Grok"""
    try:
        messages = []

        if req.history:
            for msg in req.history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("text", "")
                })

        messages.append({
            "role": "user",
            "content": req.message
        })

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        logger.info(f"Chat response generated successfully")

        return {
            "success": True,
            "reply": reply
        }

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/research/topic")
def research_topic(req: ResearchTopicRequest):
    """Start research pipeline for a topic"""
    try:
        prompt = f"""
You are an advanced agentic research assistant.

Topic: {req.topic}
Mode: {req.mode}

Generate a structured research response with:
1. Topic overview
2. Important research aspects
3. Advanced problem statements
4. Research directions
5. Suitable methodologies / models / approaches
6. Data or resources required
7. Expected outputs
8. Step-by-step roadmap

Keep the output practical, detailed, and useful for a research workflow.
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful research planning assistant."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1000,
            temperature=0.7
        )

        reply = response.choices[0].message.content
        logger.info(f"Research topic response generated for topic: {req.topic}")

        return {
            "success": True,
            "topic": req.topic,
            "mode": req.mode,
            "reply": reply
        }

    except Exception as e:
        logger.error(f"Research topic error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Experiment Mode Endpoint
# -----------------------------
@app.post("/api/experiment/mode")
def experiment_mode(req: ExperimentModeRequest):
    try:
        response = llm_call_backend(
            messages=[
                {"role": "system", "content": f"Suggest 3 experiment approaches for {req.domain}. Return ONLY a JSON array of objects with: approach, approach_description (2 sentences), dataset, dataset_url, expected_output, difficulty, estimated_time."},
                {"role": "user", "content": f"Problem: {req.problem_statement}"}
            ],
            max_tokens=800
        )
        content = response.choices[0].message.content.strip()
        
        # Robust JSON cleaning
        cleaned = content
        if "```" in cleaned:
            parts = cleaned.split("```")
            for part in parts:
                p = part.strip()
                if p.startswith("json"): p = p[4:].strip()
                if p.startswith("[") or p.startswith("{"):
                    cleaned = p
                    break
        
        try:
            suggestions = json.loads(cleaned)
            return {
                "success": True,
                "problem": req.problem_statement,
                "domain": req.domain,
                "suggestions": suggestions,
                "generated_at": datetime.utcnow().isoformat()
            }
        except json.JSONDecodeError:
            # If parsing fails, return a friendly error
            return {
                "success": False,
                "detail": "The AI provided a non-JSON response. Please try a more specific problem statement."
            }
    except Exception as e:
        logger.error(f"Experiment mode error: {e}")
        return {"success": False, "detail": str(e)}

@app.post("/api/experiment/analyze")
def analyze_experiment(req: ExperimentAnalysisRequest):
    try:
        response = llm_call_backend(
            messages=[
                {"role": "system", "content": f"You are a sports data scientist. Analyze the experiment for {req.domain}. Include hypothetical data findings (e.g., '60% probability of performance uplift'). Be concise. Return ONLY a JSON object with: analysis (1 paragraph with stats), pros (list of 3), cons (list of 3), visualization_plan (list of 2), image_keywords (list of 3), code (concise Python script)."},
                {"role": "user", "content": f"Problem: {req.problem_statement}\nApproach: {req.suggestion.approach}"}
            ],
            max_tokens=1200
        )
        content = response.choices[0].message.content.strip()
        
        # Robust JSON cleaning
        cleaned = content
        if "```" in cleaned:
            parts = cleaned.split("```")
            for part in parts:
                p = part.strip()
                if p.startswith("json"): p = p[4:].strip()
                if p.startswith("[") or p.startswith("{"):
                    cleaned = p
                    break
        
        try:
            analysis_data = json.loads(cleaned)
            return {
                "analysis": analysis_data.get("analysis", ""),
                "pros": analysis_data.get("pros", []),
                "cons": analysis_data.get("cons", []),
                "visualization_plan": analysis_data.get("visualization_plan", []),
                "image_keywords": analysis_data.get("image_keywords", []),
                "preview_image_url": "/static/plots/research_preview.png",
                "code": analysis_data.get("code", ""),
                "generated_at": datetime.utcnow().isoformat()
            }
        except json.JSONDecodeError:
            return {
                "analysis": "Error: The AI returned an invalid format.",
                "pros": [], "cons": [], "visualization_plan": [], "image_keywords": [],
                "preview_image_url": "/static/plots/research_preview.png",
                "code": "# Parsing error.",
                "generated_at": datetime.utcnow().isoformat()
            }
    except Exception as e:
        return {
            "analysis": f"Error: {str(e)}",
            "pros": [],
            "cons": [],
            "visualization_plan": [],
            "image_keywords": [],
            "preview_image_url": "/static/plots/research_preview.png",
            "code": "# Failed to generate code.",
            "generated_at": datetime.utcnow().isoformat()
        }
