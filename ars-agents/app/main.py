import asyncio
import json
import os
from datetime import datetime
from typing import Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# Load environment variables from .env file
load_dotenv()

from .schemas import (
    RunRequest, TopicResearchRequest, DocSummaryRequest, DocSummaryResponse, ReportRequest,
    ExperimentModeRequest, ExperimentAnalysisRequest, ExperimentAnalysisResponse
)
from .graphs.research_graph import NODES
from .tools.summarize import summarize_documents
from .tools.report import generate_report
from .agents import knowledge, hypothesis, experiment, execution, analysis, validation, learning
from .agents.experiment_mode import suggest_experiment, analyze_suggestion

app = FastAPI(title="ARS Agentic Service")

# allow your frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static directories exist
static_dir = os.path.join(os.path.dirname(__file__), "static")
plots_dir = os.path.join(static_dir, "plots")
os.makedirs(plots_dir, exist_ok=True)

# Mount static files for plots
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Agent functions mapped by node name
AGENT_FNS = {
    "knowledge": knowledge.run,
    "hypothesis": hypothesis.run,
    "experiment": experiment.run,
    "execution": execution.run,
    "analysis": analysis.run,
    "validation": validation.run,
    "learning": learning.run,
}

# in-memory store (ok for dev)
RUNS: Dict[str, Dict[str, Any]] = {}
LOCK = asyncio.Lock()

def _mk_event(event: str, data: Any) -> Dict[str, Any]:
    return {"event": event, "data": data}

async def _push(run_id: str, event: str, data: Any):
    async with LOCK:
        RUNS[run_id]["events"].append(_mk_event(event, data))

def _init_state(run_id: str, goal: str, mode: str, domain: str = "AI", iteration: int = 1) -> Dict[str, Any]:
    return {
        "run_id": run_id,
        "goal": goal,
        "mode": mode,
        "domain": domain,
        "iteration": iteration,
        "active_node": None,
        "node_status": {k: "queued" for k in NODES},
        "logs": [],
        "workspace": {
            "knowledge": [],
            "hypotheses": [],
            "experiments": [],
            "results": [],
            "analysis": {"patterns": [], "conclusions": [], "improvements": []},
            "validation": [],
            "learning": {"key_learnings": [], "best_practices": [], "next_focus": [], "risk_mitigations": []},
            "evaluation": {
                "novelty_score": 0.0,
                "reasoning_depth": 0.0,
                "confidence_score": 0.0,
                "iteration_improvement": 0.0,
                "convergence_signal": False,
                "recommended_iterations": 0,
            },
            "final": "",
        },
    }

async def _run_pipeline(run_id: str, goal: str, mode: str, domain: str = "AI"):
    """Run the 7-agent pipeline with per-node streaming."""
    state = _init_state(run_id, goal, mode, domain)

    await _push(run_id, "run_started", {
        "run_id": run_id,
        "ts": datetime.utcnow().isoformat(),
        "goal": goal,
        "mode": mode,
        "domain": domain,
    })
    await _push(run_id, "state_update", state)

    # Determine which nodes to run based on mode
    if mode == "quick":
        nodes_to_run = ["knowledge", "hypothesis", "experiment"]
    else:
        nodes_to_run = list(NODES)

    # Run each agent node sequentially with real execution
    for node in nodes_to_run:
        # Mark node as running
        state["active_node"] = node
        state["node_status"][node] = "running"

        await _push(run_id, "node_started", {
            "node": node,
            "ts": datetime.utcnow().isoformat(),
        })
        await _push(run_id, "state_update", state)
        await asyncio.sleep(0.05)

        try:
            # Run the actual agent function (blocking LLM call)
            agent_fn = AGENT_FNS[node]
            state = await asyncio.get_event_loop().run_in_executor(None, agent_fn, state)

            # Mark node as done
            state["node_status"][node] = "done"

            await _push(run_id, "node_finished", {
                "node": node,
                "status": "done",
                "ts": datetime.utcnow().isoformat(),
            })

        except Exception as e:
            # Mark node as failed but continue
            state["node_status"][node] = "failed"
            state.setdefault("logs", []).append({
                "ts": datetime.utcnow().isoformat(),
                "tone": "error",
                "msg": f"Agent {node} failed: {str(e)}",
                "node": node,
            })

            await _push(run_id, "node_finished", {
                "node": node,
                "status": "failed",
                "ts": datetime.utcnow().isoformat(),
                "error": str(e),
            })

        # Push updated state after each node
        await _push(run_id, "state_update", state)
        await asyncio.sleep(0.05)

    # Mark remaining nodes as idle (for quick mode)
    for node in NODES:
        if state["node_status"][node] == "queued":
            state["node_status"][node] = "idle"

    state["active_node"] = None

    # Final state push
    await _push(run_id, "state_update", state)
    await _push(run_id, "run_finished", {
        "run_id": run_id,
        "ts": datetime.utcnow().isoformat(),
    })

    async with LOCK:
        RUNS[run_id]["state"] = state
        RUNS[run_id]["done"] = True

@app.post("/api/runs")
async def start_run(req: RunRequest):
    run_id = f"run_{int(datetime.utcnow().timestamp() * 1000)}"
    async with LOCK:
        RUNS[run_id] = {"events": [], "state": None, "done": False}

    asyncio.create_task(_run_pipeline(run_id, req.goal, req.mode, req.domain))
    return {"run_id": run_id}

@app.get("/api/runs/{run_id}")
async def get_run(run_id: str):
    async with LOCK:
        if run_id not in RUNS:
            return {"error": "run_id not found"}
        r = RUNS[run_id]
        return {"run_id": run_id, "done": r["done"], "state": r["state"]}

@app.get("/api/runs/{run_id}/stream")
async def stream(run_id: str):
    async with LOCK:
        if run_id not in RUNS:
            return StreamingResponse(iter([b"event:error\ndata:{\"msg\":\"run_id not found\"}\n\n"]),
                                     media_type="text/event-stream")

    async def gen():
        idx = 0
        while True:
            async with LOCK:
                events = RUNS[run_id]["events"]
                done = RUNS[run_id]["done"]

            while idx < len(events):
                e = events[idx]
                payload = json.dumps(e["data"])
                yield f"event:{e['event']}\ndata:{payload}\n\n".encode("utf-8")
                idx += 1

            if done:
                break
            await asyncio.sleep(0.15)

    return StreamingResponse(gen(), media_type="text/event-stream")

@app.post("/api/summarize", response_model=DocSummaryResponse)
async def summarize(req: DocSummaryRequest):
    """Summarize documents and extract key insights, concepts, entities, and claims."""
    result = summarize_documents(req.docIds, req.goal)
    return DocSummaryResponse(**result)

@app.post("/api/research/topic")
async def research_topic(req: TopicResearchRequest):
    """Conduct agentic research on a topic without documents"""
    run_id = f"topic_{int(datetime.utcnow().timestamp() * 1000)}"
    async with LOCK:
        RUNS[run_id] = {"events": [], "state": None, "done": False}

    goal = f"Research and analyze the topic: {req.topic}. Generate testable hypotheses, experiment designs, and actionable insights."
    asyncio.create_task(_run_pipeline(run_id, goal, req.mode, req.domain))
    return {"run_id": run_id}

@app.post("/api/report")
async def get_report(req: ReportRequest):
    """Generate a research report from a completed run."""
    async with LOCK:
        if req.run_id not in RUNS:
            return JSONResponse(status_code=404, content={"error": "run_id not found"})
        r = RUNS[req.run_id]
        if not r["done"]:
            return JSONResponse(status_code=400, content={"error": "Run not yet complete"})
        state = r["state"]

    report = generate_report(state)
    return {"run_id": req.run_id, "report": report}

@app.get("/api/runs")
async def list_runs():
    """List all runs with their status."""
    async with LOCK:
        runs_list = []
        for run_id, r in RUNS.items():
            runs_list.append({
                "run_id": run_id,
                "done": r["done"],
                "goal": r["state"].get("goal", "") if r["state"] else "",
                "domain": r["state"].get("domain", "AI") if r["state"] else "AI",
            })
    return {"runs": runs_list}

@app.post("/api/experiment/suggestions")
async def get_experiment_suggestions(req: ExperimentModeRequest):
    """Generate 3 experiment suggestions for a problem statement."""
    result = suggest_experiment(req.problem_statement, req.domain)
    return result

@app.post("/api/experiment/analyze")
async def analyze_experiment_suggestion(req: ExperimentAnalysisRequest):
    """Perform deep analysis of a selected experiment suggestion."""
    result = analyze_suggestion(req.problem_statement, req.suggestion.dict(), req.domain)
    return result