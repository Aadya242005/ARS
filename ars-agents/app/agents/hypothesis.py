import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call

def run(state: AgentState) -> AgentState:
    state["active_node"] = "hypothesis"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Hypothesis agent: generating testable hypotheses from knowledge…",
        "node": "hypothesis",
    })

    goal = state.get("goal", "")
    domain = state.get("domain", "general")
    knowledge = state.get("workspace", {}).get("knowledge", [])

    # Build context from extracted knowledge
    knowledge_context = "\n".join([
        f"- {item.get('claim', '')} (confidence: {item.get('confidence', 'N/A')}, source: {item.get('source', 'N/A')})"
        for item in knowledge
    ])

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a research scientist specializing in {domain}. Generate testable hypotheses based on the research goal and available knowledge.

For each hypothesis you MUST provide:
- A unique ID (H1, H2, H3, etc.)
- A clear, specific claim
- A measurable prediction
- A justification explaining WHY this hypothesis was generated
- Supporting evidence from the knowledge base
- A novelty_score (0.0-1.0) indicating how novel this hypothesis is
- A confidence (0.0-1.0) indicating your confidence in the hypothesis

Use chain-of-thought reasoning. Think step by step about what gaps exist in the knowledge and what could be tested.

Return ONLY a valid JSON array, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}
Domain: {domain}

Available Knowledge:
{knowledge_context}

Generate 3-5 testable hypotheses with predictions and justifications.
Return as a JSON array of objects with keys: id, claim, prediction, justification, supporting_evidence, novelty_score, confidence"""
                }
            ],
            max_tokens=1500,
            temperature=0.7
        )

        response_text = response.choices[0].message.content

        # Parse the LLM response
        try:
            # Clean markdown if present
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            hypotheses = json.loads(cleaned)

            if not isinstance(hypotheses, list):
                raise ValueError("Response is not a list")

            # Validate and normalize each hypothesis
            validated = []
            for i, h in enumerate(hypotheses):
                validated.append({
                    "id": h.get("id", f"H{i+1}"),
                    "claim": h.get("claim", ""),
                    "prediction": h.get("prediction", ""),
                    "justification": h.get("justification", "Generated from knowledge analysis"),
                    "supporting_evidence": h.get("supporting_evidence", ""),
                    "novelty_score": float(h.get("novelty_score", 0.5)),
                    "confidence": float(h.get("confidence", 0.5)),
                })

            ws = state.setdefault("workspace", {})
            ws["hypotheses"] = validated

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good",
                "msg": f"Generated {len(validated)} hypotheses with chain-of-thought reasoning",
                "node": "hypothesis",
            })

        except (json.JSONDecodeError, ValueError):
            # Fallback: extract what we can from the text
            ws = state.setdefault("workspace", {})
            ws["hypotheses"] = [
                {
                    "id": "H1",
                    "claim": response_text[:300] if response_text else "Hypothesis generation produced unstructured output",
                    "prediction": "Requires manual review",
                    "justification": "Auto-extracted from LLM response",
                    "supporting_evidence": "Based on knowledge analysis",
                    "novelty_score": 0.5,
                    "confidence": 0.4,
                }
            ]

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Hypotheses generated but JSON parsing failed — using fallback extraction",
                "node": "hypothesis",
            })

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