import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call

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
    domain = state.get("domain", "general")

    # Build context from hypotheses
    hyp_context = "\n".join([
        f"- {h.get('id')}: {h.get('claim')} → Prediction: {h.get('prediction')} (confidence: {h.get('confidence', 'N/A')})"
        for h in hypotheses
    ])

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an experimental designer specializing in {domain}. Design concrete experiments with measurable metrics to test the given hypotheses.

For each experiment provide:
- id: E1, E2, etc.
- hypothesis: which hypothesis ID it tests (H1, H2, etc.)
- title: short descriptive title
- metric: the specific metric to measure
- methodology: step-by-step experimental procedure
- baseline: expected baseline value (numeric, 0.0-1.0)
- success_criteria: what constitutes success (e.g. ">= 0.80")
- confounds: potential confounding variables to control for
- data_requirements: what data is needed

Return ONLY a valid JSON array, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}
Domain: {domain}

Hypotheses to test:
{hyp_context}

Design one experiment per hypothesis with specific metrics and success criteria.
Return as a JSON array."""
                }
            ],
            max_tokens=1500,
            temperature=0.7
        )

        response_text = response.choices[0].message.content

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            experiments = json.loads(cleaned)

            if not isinstance(experiments, list):
                raise ValueError("Response is not a list")

            validated = []
            for i, e in enumerate(experiments):
                validated.append({
                    "id": e.get("id", f"E{i+1}"),
                    "hypothesis": e.get("hypothesis", f"H{i+1}"),
                    "title": e.get("title", f"Experiment {i+1}"),
                    "metric": e.get("metric", "accuracy"),
                    "methodology": e.get("methodology", ""),
                    "baseline": float(e.get("baseline", 0.5)),
                    "success_criteria": e.get("success_criteria", ">= 0.70"),
                    "confounds": e.get("confounds", ""),
                    "data_requirements": e.get("data_requirements", ""),
                })

            ws = state.setdefault("workspace", {})
            ws["experiments"] = validated

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good",
                "msg": f"Designed {len(validated)} experiments with metrics and success criteria",
                "node": "experiment",
            })

        except (json.JSONDecodeError, ValueError):
            ws = state.setdefault("workspace", {})
            ws["experiments"] = [
                {
                    "id": "E1",
                    "hypothesis": "H1",
                    "title": "Primary experiment",
                    "metric": "accuracy",
                    "methodology": response_text[:300] if response_text else "Experiment design requires review",
                    "baseline": 0.5,
                    "success_criteria": ">= 0.70",
                    "confounds": "Uncontrolled variables",
                    "data_requirements": "Requires domain data",
                }
            ]

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Experiments designed but JSON parsing failed — using fallback",
                "node": "experiment",
            })

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