import os
import json
import sqlite3
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI

# -----------------------------
# Logging
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -----------------------------
# Env + OpenAI
# -----------------------------
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing in environment; set it in .env or export it")

client = OpenAI(api_key=OPENAI_API_KEY)
logger.info("Loaded OPENAI_API_KEY successfully")


DB_PATH = "docs.db"


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
    conn.commit()
    conn.close()


# -----------------------------
# Chunking + Embeddings
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


def get_embedding(text: str) -> str:
    """Get OpenAI embedding for text"""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return json.dumps(response.data[0].embedding)
    except Exception as e:
        logger.error(f"Embedding error: {e}")
        raise


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
    import math

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


# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def health():
    return {"status": "ok", "app": "ARS Backend"}


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
    """General chat endpoint using OpenAI"""
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
            model="gpt-3.5-turbo",
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
            model="gpt-3.5-turbo",
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
