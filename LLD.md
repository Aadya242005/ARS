# Low-Level Design (LLD)

## 1. Introduction
This document details the internal workings, component classes, and specific data structures used within the ARS (Autonomous Research Scientist) framework.

## 2. State Management (`workspace` schema)
The core of ARS is the LangGraph state machine. The state is represented as a strictly typed Python dictionary (`TypedDict`) passed between nodes:

```python
class ResearchState(TypedDict):
    topic: str
    documents: List[str]
    knowledge: List[Dict[str, Any]] # {"claim": str, "source": str, "confidence": float}
    hypotheses: List[Dict[str, str]] # {"id": str, "claim": str, "prediction": str}
    experiments: List[Dict[str, str]] 
    results: List[Dict[str, Any]]
    analysis: Dict[str, List[str]]
    validation: List[Dict[str, str]]
    learning: Dict[str, List[str]]
    final_report: str
    logs: List[Dict[str, str]] # {"timestamp": str, "agent": str, "message": str}
```

## 3. Agent Component Design
Each agent is implemented as a discrete LangGraph node. 

### 3.1 Base Agent Interface
All agents follow a standard execution interface:
1. **Input:** Receives current `ResearchState`.
2. **Process:** Constructs a specific prompt using previous state data.
3. **Inference:** Calls the LLM API using structured output (JSON mode).
4. **Output:** Appends generated data to the corresponding state key and logs execution.

### 3.2 Specific Implementations
- **Knowledge Agent (`agents/knowledge.py`):** Uses TF-IDF cosine similarity to retrieve top-k chunks from the backend. Prompts the LLM to extract factual claims.
- **Hypothesis Agent (`agents/hypothesis.py`):** Maps over the `knowledge` array to generate falsifiable claims.
- **Validation Agent (`agents/validation.py`):** Acts as a programmatic gateway. It cross-references `results` with `hypotheses` to check for logical consistency and data leakage.

## 4. Backend Search Implementation
Instead of relying on costly external embedding APIs, the backend utilizes a local TF-IDF implementation:

```python
class LocalSearchEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.documents = []
        self.matrix = None

    def index(self, chunks: List[str]):
        self.documents = chunks
        self.matrix = self.vectorizer.fit_transform(chunks)

    def search(self, query: str, top_k: int = 5) -> List[str]:
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.matrix).flatten()
        top_indices = similarities.argsort()[-top_k:][::-1]
        return [self.documents[i] for i in top_indices if similarities[i] > 0.1]
```

## 5. Frontend Component Tree
The React frontend is built with modularity in mind:
- `App.jsx`: Root router.
- `pages/Searchresearch.jsx`: Main interface for triggering workflows.
- `components/MarkdownRenderer.jsx`: Custom utility for parsing and rendering LLM markdown output into styled React components.
- `components/ResearchCards.jsx`: Animated UI components for displaying agent outputs.

## 6. API Endpoints
### Backend Service (`5050`)
- `POST /api/docs/upload`: Accepts `multipart/form-data` for document ingestion.
- `POST /api/search`: Accepts `{"query": str}`, returns top-k text chunks.

### Agentic Service (`8000`)
- `POST /api/runs`: Accepts `{"topic": str}`, initializes graph, returns `run_id`.
- `GET /api/runs/{run_id}/stream`: SSE endpoint yielding real-time JSON logs of agent progress.
