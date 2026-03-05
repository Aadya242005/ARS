from langgraph.graph import StateGraph, END
from ..state import AgentState
from ..agents import knowledge, hypothesis, experiment, execution, analysis, validation, learning

NODES = ["knowledge", "hypothesis", "experiment", "execution", "analysis", "validation", "learning"]

def build_research_graph():
    """
    Build the agentic research cycle:
    
    Knowledge → Hypothesis → Experiment → Execution → Analysis → Validation → Learning
    """
    g = StateGraph(AgentState)

    g.add_node("knowledge", knowledge.run)
    g.add_node("hypothesis", hypothesis.run)
    g.add_node("experiment", experiment.run)
    g.add_node("execution", execution.run)
    g.add_node("analysis", analysis.run)
    g.add_node("validation", validation.run)
    g.add_node("learning", learning.run)

    g.set_entry_point("knowledge")
    g.add_edge("knowledge", "hypothesis")
    g.add_edge("hypothesis", "experiment")
    g.add_edge("experiment", "execution")
    g.add_edge("execution", "analysis")
    g.add_edge("analysis", "validation")
    g.add_edge("validation", "learning")
    g.add_edge("learning", END)

    return g.compile()
