# 7-Agent Research Cycle - Visual Flow

## Full Pipeline Diagram

```
                          DOCUMENTS / RESEARCH GOAL
                               │
                               ▼
                    ┌─────────────────────┐
                    │   1. KNOWLEDGE      │
                    │   Agent             │
                    │                     │
                    │ Input: Docs + Goal  │
                    │ Process: RAG + LLM  │
                    │ Output: Key Points, │
                    │         Constraints │
                    │         Entities    │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  2. HYPOTHESIS      │
                    │  Agent              │
                    │                     │
                    │ Input: Knowledge    │
                    │ Process: Gen H1,H2… │
                    │ Output: Testable    │
                    │         Claims      │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  3. EXPERIMENT      │
                    │  Agent              │
                    │                     │
                    │ Input: Hypotheses   │
                    │ Process: Design E1, │
                    │          E2, E3...  │
                    │ Output: Metrics &   │
                    │         Success     │
                    │         Criteria    │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  4. EXECUTION       │
                    │  Agent              │
                    │                     │
                    │ Input: Experiments  │
                    │ Process: Run/Sim    │
                    │ Output: Results,    │
                    │         Metrics,    │
                    │         Logs        │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  5. ANALYSIS        │
                    │  Agent              │
                    │                     │
                    │ Input: Results      │
                    │ Process: Interpret, │
                    │          Pattern    │
                    │ Output: Patterns,   │
                    │         Conclusions,│
                    │         Improvements│
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  6. VALIDATION      │
                    │  Agent              │
                    │                     │
                    │ Input: All Outputs  │
                    │ Process: 8 Checks   │
                    │ Output: Pass/Fail   │
                    │         per check   │
                    └────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │  7. LEARNING        │
                    │  Agent              │
                    │                     │
                    │ Input: All Outputs  │
                    │ Process: Synthesize │
                    │ Output: Key Learn,  │
                    │         Best Prax,  │
                    │         Next Focus  │
                    └────────┬────────────┘
                             │
                             ▼
                       FINAL REPORT
                    (workspace.final)
```

---

## State Progression

```
ITERATION START
    │
    ├─ workspace.knowledge = []
    ├─ workspace.hypotheses = []
    ├─ workspace.experiments = []
    ├─ workspace.results = []
    ├─ workspace.analysis = {}
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Knowledge Agent runs]
    │
    ├─ workspace.knowledge = [...]  ✓ FILLED
    ├─ workspace.hypotheses = []
    ├─ workspace.experiments = []
    ├─ workspace.results = []
    ├─ workspace.analysis = {}
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Hypothesis Agent runs - uses knowledge]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]  ✓ FILLED
    ├─ workspace.experiments = []
    ├─ workspace.results = []
    ├─ workspace.analysis = {}
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Experiment Agent runs - uses hypotheses]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]
    ├─ workspace.experiments = [...]  ✓ FILLED
    ├─ workspace.results = []
    ├─ workspace.analysis = {}
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Execution Agent runs - uses experiments]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]
    ├─ workspace.experiments = [...]
    ├─ workspace.results = [...]  ✓ FILLED
    ├─ workspace.analysis = {}
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Analysis Agent runs - uses results]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]
    ├─ workspace.experiments = [...]
    ├─ workspace.results = [...]
    ├─ workspace.analysis = {...}  ✓ FILLED
    ├─ workspace.validation = []
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Validation Agent runs - validates all]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]
    ├─ workspace.experiments = [...]
    ├─ workspace.results = [...]
    ├─ workspace.analysis = {...}
    ├─ workspace.validation = [...]  ✓ FILLED
    ├─ workspace.learning = {}
    └─ workspace.final = ""
    │
    ▼ [Learning Agent runs - synthesizes]
    │
    ├─ workspace.knowledge = [...]
    ├─ workspace.hypotheses = [...]
    ├─ workspace.experiments = [...]
    ├─ workspace.results = [...]
    ├─ workspace.analysis = {...}
    ├─ workspace.validation = [...]
    ├─ workspace.learning = {...}  ✓ FILLED
    └─ workspace.final = "✅ ..."  ✓ FILLED
    │
    ▼
ITERATION COMPLETE
```

---

## Data Dependencies

```
INPUT: Documents + Goal
    │
    ├──→ Knowledge Agent
    │         │
    │         ▼ knowledge[] ◄──┐
    │                          │
    │         ├───────────────┼────────────┐
    │         │               │            │
    │         ├──X Analysis   │            │
    │         │  (needs results)
    │         │
    │         └──→ Hypothesis Agent
    │                   │
    │                   ▼ hypotheses[] ◄──┐
    │                                      │
    │            ├──────────────────────┤ │
    │            │                      │ │
    │            ├─→ Experiment Agent   │ │
    │            │        │             │ │
    │            │        ▼ experiments[]│
    │            │              │       │ │
    │            │              ├──→ Execution Agent
    │            │              │        │
    │            │              │        ▼ results[]
    │            │              │           │
    │            │              └───────→ Analysis Agent
    │            │                          │
    │            │                          ▼ analysis{}
    │            │                              │
    │            └──────────────────────────→ Validation Agent
    │                                           │
    │                                           ▼ validation[]
    │                                               │
    └───────────────────────────────────────→ Learning Agent
                                                   │
                                                   ▼ learning{}
                                                   
                                        final = "✅ ..."
```

---

## Processing Timeline

```
Time (minutes)
0     1     2     3     4     5
|-----|-----|-----|-----|-----|

Knowledge:    ▓▓▓▓▓▓▓▓▓▓ (~15-20s)

         Hypothesis: ▓▓▓▓▓▓▓▓ (~12-15s)
         
                Experiment: ▓▓▓▓▓▓▓▓ (~12-15s)
                
                       Execution: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (~20-180s)
                       
                                    Analysis: ▓▓▓▓▓▓▓▓▓ (~15-20s)
                                    
                                           Validation: ▓▓▓▓▓▓▓▓ (~12-15s)
                                           
                                                  Learning: ▓▓▓▓▓▓▓▓▓ (~15-20s)
                                                  
Total: ~3-5 minutes (mainly LLM latency)
```

---

## Node Status Transitions

```
For each agent, the status follows:

Agent starts:
    active_node = "agent_name"
    node_status["agent_name"] = "running"
    
    ▼ [Agent does work] ▼
    
Agent completes:
    node_status["agent_name"] = "done"
    active_node = null (after last agent)

Frontend shows:
    Queue: [.........]
    ↓
    Running: [....●.....]  ← current agent
    ↓
    Done: [✓✓✓✓.....]  ← completed agents
```

---

## API Flow

```
User
  │
  ├─ POST /api/runs (start pipeline)
  │      └─→ Returns: {"run_id": "run_12345"}
  │
  ├─ GET /api/runs/{run_id}/stream (monitor real-time)
  │      └─→ Returns: SSE stream of events
  │          Events: "node_started", "node_finished", "state_update", "run_finished"
  │
  └─ GET /api/runs/{run_id} (get final results)
       └─→ Returns: {"run_id": "...", "done": true, "state": {...}}

Backend
  │
  ├─ POST /api/docs/upload (store document)
  │      └─→ Returns: {"file": "...", "chunks": N}
  │
  └─ POST /api/docs/retrieve (get relevant chunks)
       └─→ Returns: {"query": "...", "chunks": [{text, score, ...}]}
```

---

## Example Message Flow

```
Frontend                Agent Service            Backend
   │                        │                      │
   ├─ POST /api/runs────────→ Start Pipeline      │
   │                        │                      │
   │  (keep stream open)    ├─ POST /docs/retrieve→ Get chunks
   │←─ SSE: node_started────┤                      │
   │                        │← Return chunks      │
   │                        ├─ Call GPT-4-turbo   │
   │←─ SSE: state_update────┤                      │
   │                        ├─ Call GPT-4-turbo   │
   │←─ SSE: node_finished───┤                      │
   │                        ├──...  (repeat)      │
   │←─ SSE: state_update────┤                      │
   │                        ├─ Call GPT-4-turbo   │
   │←─ SSE: run_finished────┤                      │
   │                        │                      │
   ├─ GET /api/runs/{id}────→ Return Final State  │
   │←─ Full Results─────────┤                      │
   │                        │                      │

Display workspace.final on frontend
```

---

## Workspace Contents Over Time

```
Start:
  workspace = {
    knowledge: [],
    hypotheses: [],
    experiments: [],
    results: [],
    analysis: {},
    validation: [],
    learning: {},
    final: ""
  }

After Knowledge:
  knowledge: [5 items from docs]
  (rest empty)

After Hypothesis:
  knowledge: [5 items]
  hypotheses: [4 testable claims]
  (rest empty)

After Experiment:
  knowledge: [5 items]
  hypotheses: [4 claims]
  experiments: [4 experiments]
  (rest empty)

...

After Learning:
  knowledge: [5 items]
  hypotheses: [4 claims]
  experiments: [4 experiments]
  results: [4 outcomes]
  analysis: {patterns, conclusions, improvements}
  validation: [8 checks]
  learning: {insights, best practices, next steps}
  final: "✅ Research completed. 4/4 experiments passed..."
```

---

## Node Dependency Graph

```
                    ┌──────────────┐
                    │   Documents  │
                    └──────┬───────┘
                           │
                  ┌────────▼────────┐
                  │ 1. Knowledge    │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │ 2. Hypothesis   │◄─────┐
                  └────────┬────────┘      │
                           │               │
                  ┌────────▼────────┐      │
                  │ 3. Experiment   │      │
                  └────────┬────────┘      │
                           │               │
                  ┌────────▼────────┐      │
                  │ 4. Execution    │      │
                  └────────┬────────┘      │
                           │               │
                  ┌────────▼────────┐      │
                  │ 5. Analysis     │      │
                  └────────┬────────┘      │
                           │               │
                  ┌────────▼────────┐      │
                  │ 6. Validation   │◄─────┤
                  └────────┬────────┘      │
                           │               │
                  ┌────────▼────────┐      │
                  │ 7. Learning     │◄─────┘
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │ Final Report    │
                  └─────────────────┘

Dependencies:
- Each agent depends only on previous agent(s)
- Can run in strict sequence
- No branching or parallelization (by design - ensures rigor)
```

---

**Visual Guide Complete**

Refer to this when:
- Understanding system flow
- Explaining to stakeholders
- Debugging execution order
- Planning customizations
