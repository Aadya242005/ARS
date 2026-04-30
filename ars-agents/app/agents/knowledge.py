import os
from datetime import datetime
from ..state import AgentState
from ..tools.retriever import retrieve
from ..tools.web import comprehensive_research
from ..client import client, llm_call

def run(state: AgentState) -> AgentState:
    state["active_node"] = "knowledge"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Knowledge agent: retrieving & analyzing documents + web research…",
        "node": "knowledge",
    })

    goal = state.get("goal", "")

    chunks = retrieve(goal, top_k=3)
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": f"Retrieved {len(chunks)} relevant document chunks",
        "node": "knowledge",
    })


    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Performing web research from multiple sources...",
        "node": "knowledge",
    })

    web_research = comprehensive_research(goal)

    # Step 3: Build comprehensive context
    context_parts = []

    if chunks:
        doc_text = "\n---\n".join([
            f"[{c['doc_name']}]\n{c['text']}"
            for c in chunks
        ])
        context_parts.append(f"UPLOADED DOCUMENTS:\n{doc_text}")

    # Add web research sources
    if web_research.get('sources'):
        # Group sources by type
        wikipedia_sources = [s for s in web_research['sources'] if s.get('source') == 'Wikipedia']
        news_sources = [s for s in web_research['sources'] if s.get('source') == 'News']
        academic_sources = [s for s in web_research['sources'] if s.get('source') == 'arXiv']
        web_sources = [s for s in web_research['sources'] if s.get('source') == 'Web']

        # Add Wikipedia
        if wikipedia_sources:
            wiki_text = "\n".join([
                f"• {source['title']}: {source['summary']}"
                for source in wikipedia_sources[:1]  # Usually just one Wikipedia result
            ])
            context_parts.append(f"WIKIPEDIA:\n{wiki_text}")

        # Add news articles
        if news_sources:
            news_text = "\n".join([
                f"• {source['title']}: {source['summary']}"
                for source in news_sources[:3]
            ])
            context_parts.append(f"RECENT NEWS:\n{news_text}")

        # Add academic papers
        if academic_sources:
            academic_text = "\n".join([
                f"• {source['title']}: {source['summary']}"
                for source in academic_sources[:2]
            ])
            context_parts.append(f"ACADEMIC RESEARCH:\n{academic_text}")

        # Add general web results
        if web_sources:
            web_text = "\n".join([
                f"• {source['title']}: {source['summary']}"
                for source in web_sources[:3]
            ])
            context_parts.append(f"WEB SEARCH RESULTS:\n{web_text}")

    full_context = "\n\n".join(context_parts)

    if not full_context.strip():
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "warning",
            "msg": "No information found from documents or web research",
            "node": "knowledge",
        })
        ws = state.setdefault("workspace", {})
        ws["knowledge"] = [
            {"claim": "No information available from documents or web sources", "source": "N/A", "confidence": 0.0}
        ]
        return state

    # Step 4: Call OpenAI to analyze and extract key knowledge points
    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert research analyst. Extract and synthesize key knowledge from multiple sources including documents, Wikipedia, news articles, academic papers, and web search results.

Focus on:
1. Key facts and concepts
2. Important entities and relationships
3. Current developments and trends
4. Domain-specific knowledge
5. Contradictions or debates in the field

Be comprehensive but concise. Prioritize recent and reliable information."""
                },
                {
                    "role": "user",
                    "content": f"""Analyze this comprehensive research data about: {goal}

Research Data:
{full_context}

Extract and synthesize the most important knowledge points. For each key finding, provide:
- The main claim/fact
- Source of information
- Confidence level (0.0-1.0)
- Brief justification

Return as a JSON array of objects with keys: claim, source, confidence, justification"""
                }
            ],
            max_tokens=1500,
            temperature=0.3
        )

        analysis = response.choices[0].message.content
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "good",
            "msg": f"Knowledge extraction complete from {len(context_parts)} sources",
            "node": "knowledge",
        })

        # Parse response and populate workspace
        try:
            # Try to parse as JSON
            import json
            knowledge_points = json.loads(analysis)
            if isinstance(knowledge_points, list):
                ws = state.setdefault("workspace", {})
                ws["knowledge"] = knowledge_points
            else:
                raise ValueError("Not a list")
        except:
            # Fallback to text parsing
            ws = state.setdefault("workspace", {})
            ws["knowledge"] = [
                {"claim": analysis[:500], "source": "synthesized_research", "confidence": 0.8, "justification": "AI analysis of multiple sources"},
                {"claim": f"Research from {len(context_parts)} sources including Wikipedia, news, and academic papers", "source": "web_research", "confidence": 0.9, "justification": "Comprehensive web research conducted"}
            ]
        
    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"LLM error: {str(e)}",
            "node": "knowledge",
        })
        ws = state.setdefault("workspace", {})
        ws["knowledge"] = [
            {"claim": f"Error: {str(e)}", "source": "error", "confidence": 0.0}
        ]
    
    return state
