import requests
from typing import List, Dict
import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5050")

def retrieve(query: str, top_k: int = 5) -> List[Dict]:
    """Retrieve top-k relevant chunks from backend"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/docs/retrieve",
            json={"query": query, "top_k": top_k}
        )
        response.raise_for_status()
        data = response.json()
        
        # Return chunks with their metadata
        return [
            {
                "chunk_id": c["chunk_id"],
                "doc_name": c["doc_name"],
                "text": c["text"],
                "score": c["score"]
            }
            for c in data.get("chunks", [])
        ]
    except Exception as e:
        print(f"Retrieval error: {e}")
        return []
