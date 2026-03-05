import os
import json
import sqlite3
import logging
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI

# configure simple logging to console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Load OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY missing in environment; set it in .env or export it")

client = OpenAI(api_key=OPENAI_API_KEY)
logger.info("loaded OPENAI_API_KEY, length=%d", len(OPENAI_API_KEY))

# Initialize SQLite database for docs
DB_PATH = "docs.db"

def init_db():
    """Initialize SQLite database with chunks table"""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_name TEXT NOT NULL,
        chunk_text TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        embedding TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()

def simple_chunk(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Simple recursive chunking by character count with overlap"""
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap if end < len(text) else end
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
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    for idx, chunk in enumerate(chunks):
        try:
            embedding = get_embedding(chunk)
            c.execute('''INSERT INTO chunks (doc_name, chunk_text, chunk_index, embedding)
                         VALUES (?, ?, ?, ?)''',
                      (doc_name, chunk, idx, embedding))
        except Exception as e:
            logger.error(f"Failed to embed chunk {idx}: {e}")
    conn.commit()
    conn.close()

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Compute cosine similarity between two vectors"""
    import math
    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    return dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0.0

def retrieve_chunks(query: str, top_k: int = 5) -> List[dict]:
    """Retrieve top-k chunks by similarity to query"""
    try:
        query_embedding = json.loads(get_embedding(query))
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("SELECT id, doc_name, chunk_text FROM chunks")
        all_chunks = c.fetchall()
        conn.close()
        
        scored = []
        for chunk_id, doc_name, chunk_text in all_chunks:
            chunk_embedding = json.loads(
                sqlite3.connect(DB_PATH).cursor().execute(
                    "SELECT embedding FROM chunks WHERE id = ?", (chunk_id,)
                ).fetchone()[0]
            )
            score = cosine_similarity(query_embedding, chunk_embedding)
            scored.append({
                "chunk_id": chunk_id,
                "doc_name": doc_name,
                "text": chunk_text,
                "score": score
            })
        
        # Sort by score and return top-k
        return sorted(scored, key=lambda x: x["score"], reverse=True)[:top_k]
    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        raise

init_db()
app = FastAPI(title="ARS Backend", version="1.0")

# React dev server + agents
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RetrievalRequest(BaseModel):
    query: str
    top_k: int = 5

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

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
        return {"file": file.filename, "chunks": len(chunks)}
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/docs/retrieve")
def retrieve(req: RetrievalRequest):
    """Retrieve top-k chunks for a query"""
    try:
        chunks = retrieve_chunks(req.query, req.top_k)
        return {"query": req.query, "chunks": chunks}
    except Exception as e:
        logger.error(f"Retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat(req: ChatRequest):
    """Chat endpoint using OpenAI"""
    try:
        # Build message history
        messages = []
        
        # Add previous messages if provided
        if req.history:
            for msg in req.history:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("text", "")
                })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": req.message
        })
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        reply = response.choices[0].message.content
        logger.info(f"Chat response: {len(reply)} chars")
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))