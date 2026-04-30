import os
import json
from datetime import datetime
from ..state import AgentState
from ..client import client, llm_call

def run(state: AgentState) -> AgentState:
    state["active_node"] = "learning"
    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "info",
        "msg": "Learning agent: synthesizing insights for next iteration…",
        "node": "learning",
    })

    results = state.get("workspace", {}).get("results", [])
    analysis = state.get("workspace", {}).get("analysis", {})
    knowledge = state.get("workspace", {}).get("knowledge", [])
    hypotheses = state.get("workspace", {}).get("hypotheses", [])
    validation = state.get("workspace", {}).get("validation", [])
    goal = state.get("goal", "")
    domain = state.get("domain", "general")
    iteration = state.get("iteration", 1)

    def sanitize_list(lst):
        if not isinstance(lst, list):
            return []
        return [str(item) for item in lst]

    conclusions = sanitize_list(analysis.get('conclusions', ['No conclusions yet']))
    improvements = sanitize_list(analysis.get('improvements', ['None identified']))
    val_issues = [f"- {v.get('check')}: {v.get('status')} - {v.get('details', '')[:80]}" 
                  for v in validation if v.get('status') != 'PASS'][:5]

    # Build comprehensive context
    context = f"""Research Goal: {goal}
Domain: {domain}
Iteration: {iteration}

CYCLE SUMMARY:
- Knowledge items extracted: {len(knowledge)}
- Hypotheses generated: {len(hypotheses)}
- Experiments run: {len(results)}
- Passed: {sum(1 for r in results if r.get('status') == 'PASS')}/{len(results)}
- Validation checks: {sum(1 for v in validation if v.get('status') == 'PASS')}/{len(validation)} passed

KEY CONCLUSIONS:
{chr(10).join(conclusions)}

IMPROVEMENTS IDENTIFIED:
{chr(10).join(improvements)}

VALIDATION ISSUES:
{chr(10).join(val_issues)}
"""

    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are a research strategist specializing in {domain}. Synthesize what was learned from this research cycle and plan the next iteration.

Provide:
- key_learnings: list of what worked and what didn't (strings)
- best_practices: list of best practices to use going forward (strings)
- next_focus: list of specific focus areas for the next iteration (strings)
- risk_mitigations: list of risks to mitigate (strings)
- novelty_score: overall novelty of findings (0.0-1.0)
- reasoning_depth: depth of reasoning analysis (0.0-1.0)
- confidence_score: overall confidence in results (0.0-1.0)
- iteration_improvement: estimated improvement vs previous iteration (0.0-1.0, 0.5 = no change)
- convergence_signal: whether research is converging (true/false)
- recommended_iterations: how many more iterations recommended (integer)

Return ONLY valid JSON object, no markdown, no code blocks."""
                },
                {
                    "role": "user",
                    "content": f"""{context}

Synthesize learnings and plan next iteration. Return JSON object."""
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

            learning_data = json.loads(cleaned)

            if not isinstance(learning_data, dict):
                raise ValueError("Response is not an object")

            ws = state.setdefault("workspace", {})
            ws["learning"] = {
                "key_learnings": sanitize_list(learning_data.get("key_learnings", [])),
                "best_practices": sanitize_list(learning_data.get("best_practices", [])),
                "next_focus": sanitize_list(learning_data.get("next_focus", [])),
                "risk_mitigations": sanitize_list(learning_data.get("risk_mitigations", [])),
            }

            # Store evaluation metrics
            ws["evaluation"] = {
                "novelty_score": float(learning_data.get("novelty_score", 0.5)),
                "reasoning_depth": float(learning_data.get("reasoning_depth", 0.5)),
                "confidence_score": float(learning_data.get("confidence_score", 0.5)),
                "iteration_improvement": float(learning_data.get("iteration_improvement", 0.5)),
                "convergence_signal": bool(learning_data.get("convergence_signal", False)),
                "recommended_iterations": int(learning_data.get("recommended_iterations", 2)),
            }

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "good",
                "msg": f"Learning synthesis complete. Novelty: {ws['evaluation']['novelty_score']:.2f}, Confidence: {ws['evaluation']['confidence_score']:.2f}",
                "node": "learning",
            })

        except (json.JSONDecodeError, ValueError):
            ws = state.setdefault("workspace", {})
            ws["learning"] = {
                "key_learnings": [response_text[:200] if response_text else "Learning synthesis produced unstructured output"],
                "best_practices": ["Review and structure the learning output manually"],
                "next_focus": ["Improve output formatting for next iteration"],
                "risk_mitigations": ["Monitor for parsing failures"],
            }
            ws["evaluation"] = {
                "novelty_score": 0.5,
                "reasoning_depth": 0.5,
                "confidence_score": 0.4,
                "iteration_improvement": 0.5,
                "convergence_signal": False,
                "recommended_iterations": 2,
            }

            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "warn",
                "msg": "Learning synthesis completed but JSON parsing failed",
                "node": "learning",
            })

    except Exception as e:
        state.setdefault("logs", []).append({
            "ts": datetime.utcnow().isoformat(),
            "tone": "error",
            "msg": f"Learning synthesis error: {str(e)}",
            "node": "learning",
        })
        ws = state.setdefault("workspace", {})
        ws["learning"] = {"key_learnings": [], "best_practices": [], "next_focus": [], "risk_mitigations": []}
        ws["evaluation"] = {
            "novelty_score": 0.0, "reasoning_depth": 0.0, "confidence_score": 0.0,
            "iteration_improvement": 0.0, "convergence_signal": False, "recommended_iterations": 0,
        }

    # Generate final summary
    passed = len([r for r in results if r.get("status") == "PASS"])
    total = len(results)
    eval_metrics = state.get("workspace", {}).get("evaluation", {})

    final_conclusions = sanitize_list(analysis.get('conclusions', ['No conclusions']))
    final_next_focus = sanitize_list(ws.get('learning', {}).get('next_focus', ['Plan next iteration']))

    ws = state.setdefault("workspace", {})
    ws["final"] = f"""✅ Research Cycle {iteration} Complete

📊 Results: {passed}/{total} experiments PASSED

🔬 Evaluation Metrics:
• Novelty Score: {eval_metrics.get('novelty_score', 0):.0%}
• Reasoning Depth: {eval_metrics.get('reasoning_depth', 0):.0%}
• Confidence Score: {eval_metrics.get('confidence_score', 0):.0%}
• Iteration Improvement: {eval_metrics.get('iteration_improvement', 0):.0%}

📋 Key Findings:
{chr(10).join(['• ' + str(c) for c in final_conclusions[:3]])}

🎯 Next Steps:
{chr(10).join(['• ' + str(f) for f in final_next_focus[:3]])}

{'🔄 Convergence detected — research is stabilizing' if eval_metrics.get('convergence_signal') else f"🚀 Recommended: {eval_metrics.get('recommended_iterations', 2)} more iteration(s)"}
"""

    state.setdefault("logs", []).append({
        "ts": datetime.utcnow().isoformat(),
        "tone": "good",
        "msg": f"Final report generated: {passed}/{total} experiments passed | Iteration {iteration}",
        "node": "learning",
    })

    state["active_node"] = None
    return state
