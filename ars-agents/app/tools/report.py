from typing import Dict, Any
from datetime import datetime


def generate_report(state: Dict[str, Any]) -> str:
    """
    Generate a structured research report in markdown format from the pipeline state.
    This can be converted to PDF on the frontend using jsPDF.
    """
    goal = state.get("goal", "Unknown")
    domain = state.get("domain", "General")
    iteration = state.get("iteration", 1)
    ws = state.get("workspace", {})

    knowledge = ws.get("knowledge", [])
    hypotheses = ws.get("hypotheses", [])
    experiments = ws.get("experiments", [])
    results = ws.get("results", [])
    analysis = ws.get("analysis", {})
    validation = ws.get("validation", [])
    learning = ws.get("learning", {})
    evaluation = ws.get("evaluation", {})

    passed = sum(1 for r in results if r.get("status") == "PASS")
    total = len(results)

    report = f"""# Autonomous Research Scientist — Research Report

**Generated:** {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}
**Domain:** {domain}
**Iteration:** {iteration}
**Goal:** {goal}

---

## Executive Summary

This report summarizes the findings from iteration {iteration} of the ARS research cycle.
A total of {len(knowledge)} knowledge items were extracted, {len(hypotheses)} hypotheses generated,
{len(experiments)} experiments designed, and {passed}/{total} experiments passed validation.

---

## 1. Knowledge Extraction

{len(knowledge)} key knowledge items were identified from the research sources:

"""

    for i, k in enumerate(knowledge, 1):
        report += f"**K{i}.** {k.get('claim', 'N/A')}\n"
        report += f"  - Source: {k.get('source', 'N/A')} | Confidence: {k.get('confidence', 'N/A')}\n"
        if k.get('justification'):
            report += f"  - Justification: {k.get('justification')}\n"
        report += "\n"

    report += """---

## 2. Hypotheses

The following testable hypotheses were generated through chain-of-thought reasoning:

"""

    for h in hypotheses:
        report += f"### {h.get('id', 'H?')}: {h.get('claim', 'N/A')}\n"
        report += f"- **Prediction:** {h.get('prediction', 'N/A')}\n"
        report += f"- **Justification:** {h.get('justification', 'N/A')}\n"
        report += f"- **Novelty Score:** {h.get('novelty_score', 'N/A')}\n"
        report += f"- **Confidence:** {h.get('confidence', 'N/A')}\n\n"

    report += """---

## 3. Experiment Design

"""

    for e in experiments:
        report += f"### {e.get('id', 'E?')}: {e.get('title', e.get('metric', 'N/A'))}\n"
        report += f"- **Tests Hypothesis:** {e.get('hypothesis', 'N/A')}\n"
        report += f"- **Metric:** {e.get('metric', 'N/A')}\n"
        report += f"- **Baseline:** {e.get('baseline', 'N/A')}\n"
        report += f"- **Success Criteria:** {e.get('success_criteria', 'N/A')}\n"
        if e.get('methodology'):
            report += f"- **Methodology:** {e.get('methodology')}\n"
        if e.get('confounds'):
            report += f"- **Confounds:** {e.get('confounds')}\n"
        report += "\n"

    report += """---

## 4. Execution Results

"""
    
    if ws.get("plot_url"):
        # Use a full URL or relative path depending on frontend needs
        # Since it's served by the agent service, we can use the relative path
        report += f"![Results Visualization]({ws['plot_url']})\n\n"

    for r in results:
        status_icon = "✅" if r.get("status") == "PASS" else "❌"
        report += f"### {status_icon} {r.get('experiment_id', 'E?')}: {r.get('metric', 'N/A')}\n"
        report += f"- **Status:** {r.get('status', 'N/A')}\n"
        report += f"- **Metric Value:** {r.get('metric_value', 'N/A')}\n"
        report += f"- **Baseline:** {r.get('baseline', 'N/A')}\n"
        report += f"- **Improvement:** {r.get('improvement', 'N/A')}\n"
        if r.get('p_value'):
            report += f"- **p-value:** {r.get('p_value')}\n"
        if r.get('confidence_interval'):
            report += f"- **Confidence Interval:** {r.get('confidence_interval')}\n"
        report += f"- **Observations:** {r.get('log', '')}\n\n"

    report += """---

## 5. Analysis

"""

    if analysis.get("key_insight"):
        report += f"**Key Insight:** {analysis['key_insight']}\n\n"

    if analysis.get("patterns"):
        report += "### Patterns Observed\n"
        for p in analysis["patterns"]:
            report += f"- {p}\n"
        report += "\n"

    if analysis.get("conclusions"):
        report += "### Conclusions\n"
        for c in analysis["conclusions"]:
            report += f"- {c}\n"
        report += "\n"

    if analysis.get("effect_sizes"):
        report += "### Effect Sizes\n"
        for e in analysis["effect_sizes"]:
            report += f"- {e}\n"
        report += "\n"

    if analysis.get("limitations"):
        report += "### Limitations\n"
        for l in analysis["limitations"]:
            report += f"- {l}\n"
        report += "\n"

    if analysis.get("improvements"):
        report += "### Suggested Improvements\n"
        for imp in analysis["improvements"]:
            report += f"- {imp}\n"
        report += "\n"

    report += """---

## 6. Validation

"""

    for v in validation:
        status_icon = "✅" if v.get("status") == "PASS" else ("⚠️" if v.get("status") == "WARN" else "❌")
        report += f"- {status_icon} **{v.get('check', 'N/A')}**: {v.get('status', 'N/A')}\n"
        report += f"  {v.get('details', '')}\n\n"

    report += """---

## 7. Evaluation Metrics

"""

    report += f"| Metric | Score |\n"
    report += f"|--------|-------|\n"
    report += f"| Novelty Score | {evaluation.get('novelty_score', 0):.0%} |\n"
    report += f"| Reasoning Depth | {evaluation.get('reasoning_depth', 0):.0%} |\n"
    report += f"| Confidence Score | {evaluation.get('confidence_score', 0):.0%} |\n"
    report += f"| Iteration Improvement | {evaluation.get('iteration_improvement', 0):.0%} |\n"
    report += f"| Convergence | {'Yes' if evaluation.get('convergence_signal') else 'No'} |\n"
    report += f"| Recommended Iterations | {evaluation.get('recommended_iterations', 0)} |\n"

    report += """

---

## 8. Learning & Next Steps

"""

    if learning.get("key_learnings"):
        report += "### Key Learnings\n"
        for l in learning["key_learnings"]:
            report += f"- {l}\n"
        report += "\n"

    if learning.get("best_practices"):
        report += "### Best Practices\n"
        for b in learning["best_practices"]:
            report += f"- {b}\n"
        report += "\n"

    if learning.get("next_focus"):
        report += "### Next Focus Areas\n"
        for f in learning["next_focus"]:
            report += f"- {f}\n"
        report += "\n"

    if learning.get("risk_mitigations"):
        report += "### Risk Mitigations\n"
        for r_item in learning["risk_mitigations"]:
            report += f"- {r_item}\n"
        report += "\n"

    report += f"""---

*Report generated by ARS (Autonomous Research Scientist) v2.0*
*Iteration {iteration} | Domain: {domain}*
"""

    return report
