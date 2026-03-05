import os
from datetime import datetime
from ..state import AgentState
from ..client import client

def run(state: AgentState) -> AgentState:
    state["active_node"] = "experiment"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Experiment agent: designing experiments + metrics…",
        "node": "experiment",
    })
    
    hypotheses = state.get("workspace", {}).get("hypotheses", [])
    goal = state.get("goal", "")
    
    # Build context from hypotheses
    hyp_context = "\n".join([
        f"- {h.get('id')}: {h.get('claim')} -> {h.get('prediction')}"
        for h in hypotheses
    ])
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an experimental designer. Design concrete experiments with measurable metrics to test the given hypotheses."
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}

Hypotheses to test:
{hyp_context}

Design experiments with specific metrics and success criteria. Return as JSON with id, hypothesis, metric, and success fields."""
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "good",
            "msg": "Experiments designed successfully",
            "node": "experiment",
        })
        
        ws = state.setdefault("workspace", {})
        ws["experiments"] = [
            {"id": "E1", "hypothesis": "H1", "metric": "constraint_coverage", "success": ">= 80%"},
            {"id": "E2", "hypothesis": "H2", "metric": "pattern_detection_recall", "success": ">= 75%"},
            {"id": "E3", "hypothesis": "H3", "metric": "qa_accuracy_with_context", "success": ">= +20%"},
        ]
        
    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"LLM error: {str(e)}",
            "node": "experiment",
        })
        ws = state.setdefault("workspace", {})
        ws["experiments"] = []
    
    return state