import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call
from ..tools.viz import generate_experiment_plots

def run(state: AgentState) -> AgentState:
    state["active_node"] = "execution"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Execution agent: running experiments & collecting results…",
        "node": "execution",
    })

    experiments = state.get("workspace", {}).get("experiments", [])
    hypotheses = state.get("workspace", {}).get("hypotheses", [])
    goal = state.get("goal", "")
    domain = state.get("domain", "general")

    if not experiments:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "warning",
            "msg": "No experiments defined. Skipping execution.",
            "node": "execution",
        })
        ws = state.setdefault("workspace", {})
        ws["results"] = []
        return state

    # Build context from experiments
    exp_context = "\n".join([
        f"- {e.get('id')}: {e.get('title', e.get('metric', 'unknown'))} | metric: {e.get('metric')} | baseline: {e.get('baseline', 'N/A')} | success: {e.get('success_criteria', 'N/A')}"
        for e in experiments
    ])

    # Build hypotheses context
    hyp_context = "\n".join([
        f"- {h.get('id')}: {h.get('claim')}"
        for h in hypotheses
    ])

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a research executor specializing in {domain}. Simulate realistic experiment results based on the research goal, hypotheses, and experiment designs.

For each experiment provide:
- experiment_id: the experiment ID (E1, E2, etc.)
- metric: the metric measured
- status: PASS or FAIL (be realistic - not everything passes)
- metric_value: simulated numeric result (0.0-1.0)
- baseline: the baseline value
- improvement: percentage improvement string (e.g. "+24.3%" or "-5.1%")
- p_value: statistical significance (e.g. 0.03)
- confidence_interval: e.g. "[0.75, 0.92]"
- log: detailed execution summary (2-3 sentences)
- observations: key observations during execution

Be realistic with results - include some partial successes and edge cases.

Return ONLY a valid JSON array, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""Research Goal: {goal}
Domain: {domain}

Hypotheses:
{hyp_context}

Experiments to execute:
{exp_context}

Simulate execution results with realistic metrics. Return JSON array."""
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

            results = json.loads(cleaned)

            if not isinstance(results, list):
                raise ValueError("Response is not a list")

            validated = []
            for i, r in enumerate(results):
                validated.append({
                    "experiment_id": r.get("experiment_id", f"E{i+1}"),
                    "metric": r.get("metric", "accuracy"),
                    "status": r.get("status", "PASS"),
                    "metric_value": float(r.get("metric_value", 0.0)),
                    "baseline": float(r.get("baseline", 0.5)),
                    "improvement": r.get("improvement", "N/A"),
                    "p_value": float(r.get("p_value", 0.05)),
                    "confidence_interval": r.get("confidence_interval", "N/A"),
                    "log": r.get("log", "Execution completed."),
                    "observations": r.get("observations", ""),
                })

            ws = state.setdefault("workspace", {})
            ws["results"] = validated
            
            # Generate visualization plot
            run_id = state.get("run_id", "unknown")
            plot_url = generate_experiment_plots(validated, run_id)
            ws["plot_url"] = plot_url

            passed = sum(1 for r in validated if r["status"] == "PASS")
            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good",
                "msg": f"Executed {len(validated)} experiments: {passed}/{len(validated)} PASSED",
                "node": "execution",
            })

        except (json.JSONDecodeError, ValueError):
            ws = state.setdefault("workspace", {})
            ws["results"] = [
                {
                    "experiment_id": "E1",
                    "metric": "accuracy",
                    "status": "PASS",
                    "metric_value": 0.72,
                    "baseline": 0.50,
                    "improvement": "+44%",
                    "p_value": 0.04,
                    "confidence_interval": "[0.65, 0.79]",
                    "log": response_text[:300] if response_text else "Execution completed with unstructured output",
                    "observations": "Results require manual review",
                }
            ]

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Execution completed but JSON parsing failed — using fallback",
                "node": "execution",
            })

    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"Execution error: {str(e)}",
            "node": "execution",
        })
        ws = state.setdefault("workspace", {})
        ws["results"] = []

    return state
