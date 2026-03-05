import os
from typing import List, Dict, Any
from ..client import client
from .retriever import retrieve

def summarize_documents(doc_ids: List[str], goal: str = "") -> Dict[str, Any]:
    """
    Summarize uploaded documents and extract key insights.
    Returns a structured summary with overview, thesis, concepts, entities, claims, etc.
    """
    
    # Step 1: Retrieve relevant chunks from documents
    query = goal if goal else "main concepts, key findings, methodology, constraints"
    chunks = retrieve(query, top_k=10)
    
    if not chunks:
        return {
            "overview": "No documents available for analysis.",
            "thesis": "Please upload documents first.",
            "docSummaries": [],
            "concepts": [],
            "entities": [],
            "keyClaims": [],
            "evidenceNeeds": [],
            "gaps": [],
            "researchPlaybook": [],
            "opinionFramework": [],
            "readingPlan": [],
            "nextActions": [],
            "questions": [],
            "goalUsed": goal,
        }
    
    # Step 2: Build context from chunks
    chunk_text = "\n---\n".join([
        f"[{c['doc_name']}]\n{c['text']}"
        for c in chunks
    ])
    
    # Step 3: Call OpenAI to extract structured insights
    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert research analyst. Extract structured insights from documents.
                    
Respond with VALID JSON (no markdown, no code blocks) with these exact fields:
{
  "overview": "1-2 sentences describing what the docs collectively cover",
  "thesis": "The central claim or main purpose of the documents",
  "concepts": ["list", "of", "key", "concepts"],
  "entities": ["list", "of", "important", "entities", "mentioned"],
  "keyClaims": [
    {"claim": "...", "confidence": "high/medium/low", "verify": "How to test this"}
  ],
  "evidenceNeeds": ["what evidence is needed to validate claims"],
  "gaps": ["What's missing from the documents"],
  "researchPlaybook": [
    {"title": "Step 1: ...", "desc": "Description of what to do"}
  ],
  "opinionFramework": [
    {"label": "What does each doc claim?", "text": "Guidance on building opinion"}
  ],
  "readingPlan": [
    {"bucket": "Topic", "items": ["doc1", "doc2"]}
  ],
  "nextActions": ["action1", "action2"],
  "questions": ["research question 1", "research question 2"]
}"""
                },
                {
                    "role": "user",
                    "content": f"""Analyze these documents and extract structured insights:

Documents:
{chunk_text}

Research Goal: {goal if goal else 'General understanding'}

Return VALID JSON with no markdown formatting."""
                }
            ],
            max_tokens=2000,
            temperature=0.5
        )
        
        analysis_text = response.choices[0].message.content
        
        # Clean up markdown if present
        if analysis_text.startswith("```"):
            analysis_text = analysis_text.split("```")[1]
            if analysis_text.startswith("json"):
                analysis_text = analysis_text[4:]
        
        import json
        analysis = json.loads(analysis_text)
        
        # Build doc summaries
        doc_summaries = []
        for i, chunk in enumerate(chunks[:3]):  # First 3 chunks as doc representatives
            doc_summaries.append({
                "id": f"doc_{i}",
                "name": chunk["doc_name"],
                "summary": chunk["text"][:300] + "...",
                "keyTakeaways": analysis.get("keyClaims", [{}])[i % len(analysis.get("keyClaims", [{}])):][:2]
                    if analysis.get("keyClaims") else []
            })
        
        # Ensure required fields exist
        result = {
            "overview": analysis.get("overview", "Documents analyzed"),
            "thesis": analysis.get("thesis", "Main research direction identified"),
            "docSummaries": doc_summaries,
            "concepts": analysis.get("concepts", []),
            "entities": analysis.get("entities", []),
            "keyClaims": analysis.get("keyClaims", []),
            "evidenceNeeds": analysis.get("evidenceNeeds", []),
            "gaps": analysis.get("gaps", []),
            "researchPlaybook": analysis.get("researchPlaybook", []),
            "opinionFramework": analysis.get("opinionFramework", []),
            "readingPlan": analysis.get("readingPlan", []),
            "nextActions": analysis.get("nextActions", []),
            "questions": analysis.get("questions", []),
            "goalUsed": goal,
        }
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return {
            "overview": "Analysis in progress",
            "thesis": "Extracting key insights from documents",
            "docSummaries": [],
            "concepts": analysis.get("concepts", []) if 'analysis' in locals() else [],
            "entities": [],
            "keyClaims": [],
            "evidenceNeeds": [],
            "gaps": [],
            "researchPlaybook": [],
            "opinionFramework": [],
            "readingPlan": [],
            "nextActions": [],
            "questions": [],
            "goalUsed": goal,
        }
    except Exception as e:
        print(f"Summarization error: {e}")
        return {
            "overview": f"Error during analysis: {str(e)[:100]}",
            "thesis": "Please try again",
            "docSummaries": [],
            "concepts": [],
            "entities": [],
            "keyClaims": [],
            "evidenceNeeds": [],
            "gaps": [],
            "researchPlaybook": [],
            "opinionFramework": [],
            "readingPlan": [],
            "nextActions": [],
            "questions": [],
            "goalUsed": goal,
        }
