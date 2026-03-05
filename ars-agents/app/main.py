import asyncio
import json
import os
from datetime import datetime
from typing import Any, Dict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Load environment variables from .env file
load_dotenv()

from .schemas import RunRequest, TopicResearchRequest, DocSummaryRequest, DocSummaryResponse
from .graphs.research_graph import build_research_graph, NODES
from .tools.summarize import summarize_documents

app = FastAPI(title="ARS Agentic Service")

# allow your frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graph = build_research_graph()

# in-memory store (ok for dev)
RUNS: Dict[str, Dict[str, Any]] = {}
LOCK = asyncio.Lock()

def _mk_event(event: str, data: Any) -> Dict[str, Any]:
    return {"event": event, "data": data}

async def _push(run_id: str, event: str, data: Any):
    async with LOCK:
        RUNS[run_id]["events"].append(_mk_event(event, data))

def _init_state(run_id: str, goal: str, mode: str) -> Dict[str, Any]:
    return {
        "run_id": run_id,
        "goal": goal,
        "mode": mode,
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
            "final": "",
        },
    }

async def _run_pipeline(run_id: str, goal: str, mode: str):
    state = _init_state(run_id, goal, mode)

    await _push(run_id, "run_started", {"run_id": run_id, "ts": datetime.utcnow().isoformat(), "goal": goal, "mode": mode})
    await _push(run_id, "state_update", state)

    # These events match your frontend needs (activeAgent + statuses)
    for node in NODES:
        state["active_node"] = node
        state["node_status"][node] = "running"
        await _push(run_id, "node_started", {"node": node, "ts": datetime.utcnow().isoformat()})
        await _push(run_id, "state_update", state)
        await asyncio.sleep(0.05)

        # run one full graph at the end for correct workspace/logs
        # (simple + reliable). For true per-node streaming, we’ll upgrade next.
        state["node_status"][node] = "done"
        await _push(run_id, "node_finished", {"node": node, "status": "done", "ts": datetime.utcnow().isoformat()})

    final_state = graph.invoke(state)
    await _push(run_id, "state_update", final_state)
    await _push(run_id, "run_finished", {"run_id": run_id, "ts": datetime.utcnow().isoformat()})

    async with LOCK:
        RUNS[run_id]["state"] = final_state
        RUNS[run_id]["done"] = True

@app.post("/api/runs")
async def start_run(req: RunRequest):
    run_id = f"run_{int(datetime.utcnow().timestamp() * 1000)}"
    async with LOCK:
        RUNS[run_id] = {"events": [], "state": None, "done": False}

    asyncio.create_task(_run_pipeline(run_id, req.goal, req.mode))
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
    asyncio.create_task(_run_pipeline(run_id, goal, req.mode))
    return {"run_id": run_id}