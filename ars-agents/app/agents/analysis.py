import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call

def run(state: AgentState) -> AgentState:
    state["active_node"] = "analysis"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Analysis agent: interpreting results & finding patterns…",
        "node": "analysis",
    })

    results = state.get("workspace", {}).get("results", [])
    hypotheses = state.get("workspace", {}).get("hypotheses", [])
    knowledge = state.get("workspace", {}).get("knowledge", [])
    goal = state.get("goal", "")
    domain = state.get("domain", "general")

    if not results:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "warning",
            "msg": "No results to analyze. Skipping.",
            "node": "analysis",
        })
        ws = state.setdefault("workspace", {})
        ws["analysis"] = {"patterns": [], "conclusions": [], "improvements": []}
        return state

    # Build context from results
    result_summary = "\n".join([
        f"- {r.get('experiment_id')}: metric={r.get('metric')} value={r.get('metric_value')} baseline={r.get('baseline')} improvement={r.get('improvement')} status={r.get('status')} p_value={r.get('p_value', 'N/A')}"
        for r in results
    ])

    hyp_summary = "\n".join([
        f"- {h.get('id')}: {h.get('claim')} (prediction: {h.get('prediction')})"
        for h in hypotheses
    ])

    knowledge_summary = "\n".join([
        f"- {k.get('claim', '')[:100]}"
        for k in knowledge[:5]
    ])

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a research analyst specializing in {domain}. Interpret experimental results, identify patterns, derive conclusions, and suggest improvements.

Provide your analysis with:
- patterns: list of observed patterns across experiments (strings)
- conclusions: list of conclusions about which hypotheses were validated/refuted (use ✓ for validated, ✗ for refuted, ⚠ for partial)
- improvements: list of specific, actionable improvements for next iteration
- key_insight: single most important insight from the analysis
- effect_sizes: list of effect size descriptions
- limitations: list of limitations of the current analysis

Return ONLY valid JSON object, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}
Domain: {domain}

Knowledge Base:
{knowledge_summary}

Hypotheses:
{hyp_summary}

Experiment Results:
{result_summary}

Analyze the results comprehensively. Return JSON object with patterns, conclusions, improvements, key_insight, effect_sizes, limitations."""
                }
            ],
            max_tokens=1200,
            temperature=0.5
        )

        response_text = response.choices[0].message.content

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            analysis = json.loads(cleaned)

            if not isinstance(analysis, dict):
                raise ValueError("Response is not an object")

            def sanitize_list(lst):
                if not isinstance(lst, list):
                    return []
                return [str(item) for item in lst]

            ws = state.setdefault("workspace", {})
            ws["analysis"] = {
                "patterns": sanitize_list(analysis.get("patterns", [])),
                "conclusions": sanitize_list(analysis.get("conclusions", [])),
                "improvements": sanitize_list(analysis.get("improvements", [])),
                "key_insight": str(analysis.get("key_insight", "")),
                "effect_sizes": sanitize_list(analysis.get("effect_sizes", [])),
                "limitations": sanitize_list(analysis.get("limitations", [])),
            }

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good",
                "msg": f"Analysis complete: {len(ws['analysis']['patterns'])} patterns, {len(ws['analysis']['conclusions'])} conclusions identified",
                "node": "analysis",
            })

        except (json.JSONDecodeError, ValueError):
            ws = state.setdefault("workspace", {})
            ws["analysis"] = {
                "patterns": [response_text[:200] if response_text else "Analysis produced unstructured output"],
                "conclusions": ["Results require manual interpretation"],
                "improvements": ["Improve prompt engineering for structured output"],
                "key_insight": "Analysis completed with partial structure",
                "effect_sizes": [],
                "limitations": ["JSON parsing failed - raw text available"],
            }

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Analysis complete but JSON parsing failed — using fallback",
                "node": "analysis",
            })

    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"Analysis error: {str(e)}",
            "node": "analysis",
        })
        ws = state.setdefault("workspace", {})
        ws["analysis"] = {"patterns": [], "conclusions": [], "improvements": []}

    return state
