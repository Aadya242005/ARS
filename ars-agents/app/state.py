from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict, total=False):
    run_id: str
    goal: str
    mode: str
    domain: str            # research domain: AI, Biology, Physics, Chemistry, etc.
    iteration: int         # current iteration number (1-based)

    # streaming + UI
    active_node: Optional[str]
    node_status: Dict[str, str]  # node -> idle/queued/running/done/failed
    logs: List[Dict[str, Any]]   # {ts, tone, msg, node?}

    # outputs shown in tabs
    workspace: Dict[str, Any]    # {
    #   knowledge: [{claim, source, confidence, justification}],
    #   hypotheses: [{id, claim, prediction, justification, supporting_evidence, novelty_score, confidence}],
    #   experiments: [{id, hypothesis, title, metric, methodology, baseline, success_criteria, confounds, data_requirements}],
    #   results: [{experiment_id, metric, status, metric_value, baseline, improvement, p_value, confidence_interval, log, observations}],
    #   analysis: {patterns, conclusions, improvements, key_insight, effect_sizes, limitations},
    #   validation: [{check, status, details, severity}],
    #   learning: {key_learnings, best_practices, next_focus, risk_mitigations},
    #   evaluation: {novelty_score, reasoning_depth, confidence_score, iteration_improvement, convergence_signal, recommended_iterations},
    #   final: str,
    # }
