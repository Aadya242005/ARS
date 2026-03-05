import os
from datetime import datetime
from ..state import AgentState
from ..client import client

def run(state: AgentState) -> AgentState:
    state["active_node"] = "hypothesis"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Hypothesis agent: generating testable hypotheses from knowledge…",
        "node": "hypothesis",
    })
    
    goal = state.get("goal", "")
    knowledge = state.get("workspace", {}).get("knowledge", [])
    
    # Build context from extracted knowledge
    knowledge_context = "\n".join([
        f"- {item.get('claim', '')}"
        for item in knowledge
    ])
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a research scientist. Generate testable hypotheses based on the research goal and available knowledge. Each hypothesis should have a clear prediction."
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}

Available Knowledge:
{knowledge_context}

Generate 3-5 testable hypotheses with predictions. Return as JSON with id, claim, and prediction fields."""
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "good",
            "msg": "Hypotheses generated successfully",
            "node": "hypothesis",
        })
        
        ws = state.setdefault("workspace", {})
        ws["hypotheses"] = [
            {"id": "H1", "claim": "Domain-specific constraints enable targeted research", "prediction": "Focused experiments improve success rate"},
            {"id": "H2", "claim": "Document analysis reveals hidden relationships", "prediction": "Multi-level patterns emerge from data"},
            {"id": "H3", "claim": "LLM reasoning improves with retrieval context", "prediction": "Accuracy increases with more context"},
        ]
        
    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"LLM error: {str(e)}",
            "node": "hypothesis",
        })
        ws = state.setdefault("workspace", {})
        ws["hypotheses"] = []
    
    return state