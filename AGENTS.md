# ARS 7-Agent Research Cycle

## Overview

The ARS system implements a complete **agentic research cycle** with 7 specialized agents working in sequence to conduct rigorous, automated research from document analysis through validation and learning.

```
Documents → Knowledge → Hypothesis → Experiment → Execution → Analysis → Validation → Learning
   ↓          ↓            ↓            ↓            ↓           ↓           ↓          ↓
  URLs       ⭐ Key        ⭐ H1, H2,   ⭐ E1, E2,   ⭐ Run      ⭐ Patterns  ⭐ Checks  ⭐ Next
  PDFs      Points        H3...        E3...        Exps       & Conc.    Passed     Steps
```



**Input:** Research goal + uploaded documents (via retriever)

**Process:**
- Retrieves top-5 relevant document chunks via semantic search
- Extracts key points, constraints, entities, metrics, and risks
- Uses OpenAI GPT-4-turbo with RAG grounding

**Output:**
```python
workspace.knowledge = [
  {
    "claim": "Model accuracy increases 25% with RAG grounding",
    "source": "research.pdf",
    "confidence": 0.92
  },
  ...
]
```

---


**Input:** Knowledge + research goal

**Process:**
- Generates testable hypotheses based on extracted knowledge
- Each hypothesis has a prediction (measurable outcome)
- Uses chain-of-thought LLM reasoning

**Output:**
```python
workspace.hypotheses = [
  {
    "id": "H1",
    "claim": "RAG-grounding improves factual accuracy",
    "prediction": "Hallucination rate decreases by ≥15%"
  },
  {
    "id": "H2",
    "claim": "Multi-hop reasoning requires better context",
    "prediction": "2-hop queries improve ≥20% vs baseline"
  },
  ...
]
```

---

### 3️⃣ **Experiment Agent** → `workspace.experiments`

**Input:** Hypotheses + research goal

**Process:**
- Converts each hypothesis into a concrete experiment design
- Defines metrics to measure, success criteria, and baseline comparisons
- Specifies methodology and potential confounds

**Output:**
```python
workspace.experiments = [
  {
    "id": "E1",
    "hypothesis": "H1",
    "metric": "hallucination_rate",
    "baseline": 0.35,
    "success_criteria": "≤ 0.20 (43% reduction)"
  },
  ...
]
```

---

### 4️⃣ **Execution Agent** → `workspace.results`

**Input:** Experiments

**Process:**
- Runs/simulates experiments (or triggers external pipelines)
- Collects results: metric values, status (PASS/FAIL), logs
- Compares to baseline

**Output:**
```python
workspace.results = [
  {
    "experiment_id": "E1",
    "metric": "hallucination_rate",
    "status": "PASS",
    "metric_value": 0.18,
    "baseline": 0.35,
    "improvement": "-48.6%",
    "log": "Execution completed. RAG grounding effective."
  },
  ...
]
```

---

### 5️⃣ **Analysis Agent** → `workspace.analysis`

**Input:** Results + hypotheses + knowledge

**Process:**
- Interprets results: which hypotheses were validated/refuted?
- Identifies patterns in the data
- Finds underlying causes and explanations
- Proposes improvements for next iteration

**Output:**
```python
workspace.analysis = {
  "patterns": [
    "RAG grounding provides 40-50% improvement across metrics",
    "Longer context window benefits longer queries"
  ],
  "conclusions": [
    "✓ H1 VALIDATED: Grounding reduces hallucinations significantly",
    "⚠ H2 PARTIAL: Multi-hop queries improve but with diminishing returns"
  ],
  "improvements": [
    "Implement adaptive retrieval (more chunks for complex queries)",
    "Add query expansion for better recall",
    "Test multi-pass retrieval strategy"
  ]
}
```

---

### 6️⃣ **Validation Agent** → `workspace.validation`

**Input:** Entire pipeline (knowledge → results)

**Process:**
- Checks for logical consistency across the pipeline
- Verifies for data leakage (results not inflated by test set contamination)
- Validates reproducibility (methods clearly defined?)
- Checks citation grounding (claims backed by docs/results?)
- Audits methodology soundness

**Output:**
```python
workspace.validation = [
  {"check": "Knowledge Completeness", "status": "PASS", "details": "..."},
  {"check": "Logical Consistency", "status": "PASS", "details": "..."},
  {"check": "Data Leakage Risk", "status": "PASS", "details": "..."},
  {"check": "Reproducibility", "status": "PASS", "details": "..."},
  ...
]
```

---

### 7️⃣ **Learning Agent** → `workspace.learning` + `workspace.final`

**Input:** All outputs from previous agents

**Process:**
- Synthesizes key learnings: what worked, what didn't
- Documents best practices for future runs
- Identifies focus areas for next iteration
- Flags risks to mitigate

**Output:**
```python
workspace.learning = {
  "key_learnings": [
    "RAG-grounding is highly effective for factuality",
    "Query preprocessing impacts retrieval quality",
    "Edge cases cluster in out-of-domain queries"
  ],
  "best_practices": [
    "Always use top-5 chunks minimum",
    "Pre-process queries to remove noise",
    "Use domain-specific embeddings"
  ],
  "next_focus": [
    "Implement multi-pass retrieval",
    "Fine-tune embeddings on domain corpus",
    "Add query expansion module"
  ],
  "risk_mitigations": [
    "Monitor for context window overflow",
    "Add groundedness checks on all outputs"
  ]
}

workspace.final = """
✅ Research Cycle Complete

Results: 3/3 experiments PASSED
Key Findings:
- RAG grounding improved metrics by 40-50%
- All hypotheses validated

🎯 Next Steps:
1. Implement adaptive retrieval
2. Add query expansion
3. Fine-tune embeddings

🚀 Ready for iteration 2!
"""
```

---

## Full Output Structure

After a complete run, `workspace` contains:

```python
workspace = {
  # Agent 1: Knowledge extraction from documents
  "knowledge": [
    {"claim": "...", "source": "doc.pdf", "confidence": 0.92}
  ],
  
  # Agent 2: Hypothesis generation
  "hypotheses": [
    {"id": "H1", "claim": "...", "prediction": "..."}
  ],
  
  # Agent 3: Experiment design
  "experiments": [
    {"id": "E1", "hypothesis": "H1", "metric": "...", "success_criteria": "..."}
  ],
  
  # Agent 4: Execution results
  "results": [
    {"experiment_id": "E1", "metric_value": 0.87, "improvement": "+24%", ...}
  ],
  
  # Agent 5: Analysis & interpretation
  "analysis": {
    "patterns": [...],
    "conclusions": [...],
    "improvements": [...]
  },
  
  # Agent 6: Validation report
  "validation": [
    {"check": "...", "status": "PASS", "details": "..."}
  ],
  
  # Agent 7: Learning & next iteration
  "learning": {
    "key_learnings": [...],
    "best_practices": [...],
    "next_focus": [...],
    "risk_mitigations": [...]
  },
  
  # Final summary
  "final": "✅ Run complete. 3/3 experiments passed. Ready for iteration 2."
}
```

---

## Running a Full Cycle

```bash
# 1. Upload research documents
curl -X POST "http://localhost:5050/api/docs/upload" \
  -F "file=@research_paper.pdf"

# 2. Start research pipeline
curl -X POST "http://localhost:8000/api/runs" \
  -H "Content-Type: application/json" \
  -d '{"goal": "Analyze RAG effectiveness", "mode": "full"}'
  # Returns: {"run_id": "run_1234567890"}

# 3. Monitor real-time progress
curl "http://localhost:8000/api/runs/run_1234567890/stream"

# 4. Get final results
curl "http://localhost:8000/api/runs/run_1234567890"
```

---

## Agent Workflow Logic

Each agent:
1. **Logs** its start (tone: "info")
2. **Processes** previous outputs
3. **Calls OpenAI** (GPT-4-turbo) with domain context
4. **Populates** workspace with results
5. **Logs** completion (tone: "good" on success, "error" on failure)

Agents **fail gracefully**: if one agent errors, the next still runs with partial data.

---

## Customization

### Add Custom Tools to Execution Agent

Modify `agents/execution.py` to:
- Call external APIs (ML eval frameworks, databases, APIs)
- Run scripts or pipelines
- Query live data sources

```python
# Example: Run external evaluation
import subprocess
result = subprocess.run(["python", "eval.py"], capture_output=True)
```

### Add Domain-Specific Prompts

Customize system prompts in any agent for your domain:

```python
response = client.chat.completions.create(
  model="gpt-4-turbo",
  messages=[{
    "role": "system",
    "content": "You are a medical research analyst specializing in..."
  }],
  ...
)
```

### Use Different LLM Models

Change model in any agent:
```python
model="gpt-4-turbo"    # Full reasoning
model="gpt-4"          # Faster
model="gpt-3.5-turbo"  # Budget-friendly
```

---

## Metrics & Monitoring

All agents log to `workspace.logs`:
```python
logs = [
  {"ts": "2024-03-05T10:30:00", "tone": "info", "msg": "...", "node": "knowledge"},
  {"ts": "2024-03-05T10:31:00", "tone": "good", "msg": "...", "node": "hypothesis"},
  ...
]
```

Track in UI:
- **Node Status**: queued → running → done/failed
- **Active Node**: which agent is running now?
- **Logs**: live stream of agent outputs

---

## FAQ

**Q: Can I run only some agents?**
A: Not currently (all 7 run in sequence), but you can modify the graph in `graphs/research_graph.py`.

**Q: How long does a full cycle take?**
A: ~2-5 minutes depending on:
- Document size (retrieval time)
- LLM response times (typically 10-20s per agent)
- Execution time (depends on your experiments)

**Q: Can I customize the number of experiments?**
A: Yes! Modify the `Experiment Agent` prompt to generate more/fewer experiments.

**Q: How do I integrate my own metrics?**
A: In the `Execution Agent`, add your custom evaluation logic that populates `workspace.results`.

---

## Next Steps

- ✅ 7-agent cycle deployed
- 📊 Add persistent storage (PostgreSQL for runs)
- 🔄 Implement feedback loops (iterate based on failures)
- 📈 Add result visualization dashboard
- 🚀 Deploy to cloud
