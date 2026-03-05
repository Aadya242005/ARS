from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict, total=False):
    run_id: str
    goal: str
    mode: str

    # streaming + UI
    active_node: Optional[str]
    node_status: Dict[str, str]  # node -> idle/queued/running/done/failed
    logs: List[Dict[str, Any]]   # {ts, tone, msg, node?}

    # outputs shown in tabs
    workspace: Dict[str, Any]    # {
    #   knowledge: [{claim, source, confidence}],
    #   hypotheses: [{id, claim, prediction}],
    #   experiments: [{id, hypothesis, metric, success_criteria}],
    #   results: [{experiment_id, status, metric_value, log}],
    #   analysis: {patterns, conclusions, improvements},
    #   validation: [{check, status, details}],
    #   final: str,
    #   learning: [{insight, confidence}]
    # }
