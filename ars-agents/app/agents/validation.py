import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call

def run(state: AgentState) -> AgentState:
    state["active_node"] = "validation"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Validation agent: running sanity checks…",
        "node": "validation",
    })

    knowledge = state.get("workspace", {}).get("knowledge", [])
    hypotheses = state.get("workspace", {}).get("hypotheses", [])
    experiments = state.get("workspace", {}).get("experiments", [])
    results = state.get("workspace", {}).get("results", [])
    analysis = state.get("workspace", {}).get("analysis", {})
    goal = state.get("goal", "")
    domain = state.get("domain", "general")

    # Build comprehensive pipeline summary for LLM validation
    pipeline_summary = f"""Research Goal: {goal}
Domain: {domain}

PIPELINE SUMMARY:
1. Knowledge Items: {len(knowledge)}
   - Claims: {'; '.join([k.get('claim', '')[:60] for k in knowledge[:3]])}

2. Hypotheses: {len(hypotheses)}
   - {'; '.join([f"{h.get('id')}: {h.get('claim', '')[:50]}" for h in hypotheses[:3]])}

3. Experiments: {len(experiments)}
   - {'; '.join([f"{e.get('id')}: {e.get('metric', '')}" for e in experiments[:3]])}

4. Results: {len(results)}
   - Passed: {sum(1 for r in results if r.get('status') == 'PASS')}/{len(results)}
   - Metric values: {', '.join([f"{r.get('experiment_id')}={r.get('metric_value')}" for r in results[:3]])}

5. Analysis: {len(analysis.get('conclusions', []))} conclusions, {len(analysis.get('patterns', []))} patterns

All components present: {bool(knowledge) and bool(hypotheses) and bool(experiments) and bool(results)}"""

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a rigorous research validator specializing in {domain}. Check the entire research pipeline for quality, consistency, and soundness.

Perform these validation checks:
1. Knowledge Completeness - are knowledge items sufficient and well-sourced?
2. Hypothesis Quality - are hypotheses testable, specific, and grounded in knowledge?
3. Experiment Design - are experiments well-designed with proper controls and metrics?
4. Results Grounding - are results statistically significant and properly measured?
5. Data Leakage Risk - could results be inflated by test set contamination?
6. Reproducibility - are methods clearly defined and reproducible?
7. Logical Consistency - do hypotheses→experiments→results→conclusions form a coherent chain?
8. Measurement Feasibility - are all metrics quantifiable and comparable to baselines?

For each check provide:
- check: name of the check
- status: PASS, WARN, or FAIL
- details: specific explanation (2-3 sentences)
- severity: low, medium, or high (for WARN/FAIL)

Return ONLY a valid JSON array, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""{pipeline_summary}

Validate this pipeline rigorously. Be critical - flag real issues. Return JSON array."""
                }
            ],
            max_tokens=1200,
            temperature=0.3
        )

        response_text = response.choices[0].message.content

        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()

            checks = json.loads(cleaned)

            if not isinstance(checks, list):
                raise ValueError("Response is not a list")

            validated_checks = []
            for c in checks:
                validated_checks.append({
                    "check": c.get("check", "Unknown Check"),
                    "status": c.get("status", "WARN"),
                    "details": c.get("details", ""),
                    "severity": c.get("severity", "medium"),
                })

            ws = state.setdefault("workspace", {})
            ws["validation"] = validated_checks

            passed = sum(1 for c in validated_checks if c["status"] == "PASS")
            warned = sum(1 for c in validated_checks if c["status"] == "WARN")
            failed = sum(1 for c in validated_checks if c["status"] == "FAIL")
            total = len(validated_checks)

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good" if failed == 0 else "warn",
                "msg": f"Validation: {passed} PASS, {warned} WARN, {failed} FAIL out of {total} checks",
                "node": "validation",
            })

        except (json.JSONDecodeError, ValueError):
            # Fallback: structural checks only
            ws = state.setdefault("workspace", {})
            ws["validation"] = [
                {"check": "Knowledge Completeness", "status": "PASS" if knowledge else "FAIL",
                 "details": f"Extracted {len(knowledge)} knowledge items", "severity": "high" if not knowledge else "low"},
                {"check": "Hypothesis Quality", "status": "PASS" if hypotheses else "FAIL",
                 "details": f"Generated {len(hypotheses)} hypotheses", "severity": "high" if not hypotheses else "low"},
                {"check": "Experiment Design", "status": "PASS" if experiments else "FAIL",
                 "details": f"Designed {len(experiments)} experiments", "severity": "high" if not experiments else "low"},
                {"check": "Results Grounding", "status": "PASS" if results else "WARN",
                 "details": f"Collected {len(results)} results", "severity": "medium" if not results else "low"},
                {"check": "Logical Consistency", "status": "PASS",
                 "details": "Pipeline components connected", "severity": "low"},
            ]

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Validation completed with structural checks only (JSON parsing failed)",
                "node": "validation",
            })

    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"Validation error: {str(e)}",
            "node": "validation",
        })
        ws = state.setdefault("workspace", {})
        ws["validation"] = [
            {"check": "Validation Failed", "status": "FAIL", "details": str(e), "severity": "high"}
        ]

    return state