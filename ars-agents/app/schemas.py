from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class RunRequest(BaseModel):
    goal: str
    mode: str = "full"  # quick | full

class TopicResearchRequest(BaseModel):
    topic: str
    mode: str = "full"  # quick | full

class RunResponse(BaseModel):
    run_id: str

class RunSnapshot(BaseModel):
    run_id: str
    done: bool
    state: Optional[Dict[str, Any]] = None

class SSEEvent(BaseModel):
    event: str
    data: Any

class DocSummaryRequest(BaseModel):
    docIds: List[str]
    goal: str = ""

class DocSummaryItem(BaseModel):
    id: str
    name: str
    summary: str
    keyTakeaways: List[str]

class DocSummaryResponse(BaseModel):
    overview: str
    thesis: str
    docSummaries: List[DocSummaryItem]
    concepts: List[str]
    entities: List[str]
    keyClaims: List[Dict[str, Any]]
    evidenceNeeds: List[str]
    gaps: List[str]
    researchPlaybook: List[Dict[str, str]]
    opinionFramework: List[Dict[str, str]]
    readingPlan: List[Dict[str, Any]]
    nextActions: List[str]
    questions: List[str]
    goalUsed: str