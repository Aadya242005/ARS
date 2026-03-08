ARS – Agentic Research System

ARS (Agentic Research System) is a full-stack AI research automation platform that uses a 7-agent workflow to transform research topics or documents into structured insights, hypotheses, experiment plans, and validated conclusions.

Instead of producing a single LLM response, ARS runs a multi-agent research cycle where specialized agents collaborate to perform analysis, testing, and validation.

Research Workflow

The system follows a structured Agentic Research Cycle:

Documents / Topic → Knowledge → Hypothesis → Experiment → Execution → Analysis → Validation → Learning

Each agent contributes a specific research capability, ensuring outputs are structured, testable, and validated rather than simple generated text.

7 Agent System
Knowledge Agent

Analyzes uploaded documents or retrieved information to extract key insights.

Outputs:

Important research points

Entities and patterns

Constraints and metrics

Research signals

Hypothesis Agent

Generates testable hypotheses based on extracted knowledge.

Outputs:

Hypothesis statements (H1, H2, H3)

Predictions

Research assumptions

Experiment Agent

Designs experiments to evaluate hypotheses.

Outputs:

Experiment plans

Evaluation metrics

Success criteria

Execution Agent

Runs experiments using available tools and pipelines.

Outputs:

Experiment results

Evaluation metrics

Execution logs

Analysis Agent

Interprets experiment outcomes and extracts insights.

Outputs:

Observations

Performance comparisons

Key insights

Validation Agent

Ensures research quality through validation checks.

Checks include:

Reproducibility

Data leakage

Robustness tests

Sanity checks

Outputs:

PASS / FAIL validation reports

Learning Agent

Synthesizes results and proposes improvements.

Outputs:

Final conclusions

Research summary

Recommended next steps

Project Structure
ARS
│
├── ars-agents
│   └── app
│       ├── agents
│       │   ├── knowledge.py
│       │   ├── hypothesis.py
│       │   ├── experiment.py
│       │   └── validation.py
│       │
│       ├── graphs
│       │   └── research_graph.py
│       │
│       ├── tools
│       │   ├── retriever.py
│       │   └── web.py
│       │
│       ├── schemas.py
│       ├── state.py
│       ├── main.py
│       └── requirements.txt
│
├── ars-backend
│   ├── api
│   ├── document_processing
│   ├── embeddings
│   └── main.py
│
├── ars-frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   │   └── AgenticResearch.jsx
│   │   ├── assets
│   │   │   └── bg11.jpg
│   │   └── App.jsx
│   │
│   └── package.json
│
├── ARCHITECTURE.md
├── AGENTS.md
├── IMPLEMENTATION.md
├── EXAMPLE_OUTPUT.md
├── VISUAL_FLOW.md
└── README.md
System Architecture

The ARS platform consists of three main layers.

Agent Layer (LangGraph)

Responsible for multi-agent orchestration and research workflow execution.

Responsibilities:

Agent coordination

State management

Research pipeline execution

Backend Layer (FastAPI)

Handles APIs and document processing.

Responsibilities:

Document ingestion

Text extraction and chunking

Embedding generation

Retrieval pipelines

API endpoints

Frontend Layer (React Dashboard)

Provides the interactive research interface.

Features:

Topic search

Document upload

Agent timeline visualization

Research result visualization

Live system logs

Dashboard Features

The Agentic Research Dashboard allows users to generate structured research outputs.

Main components include:

Topic Search

Users enter a research topic and trigger the agent workflow.

Research Workspace

Displays structured outputs including:

Overview

Key points collected

Hypotheses

Experiment plans

Risks and limitations

Next steps

Agent Timeline

Shows real-time execution status of each research agent.

Live Logs

Displays messages and system activity during the research cycle.

Installation
Clone Repository
git clone <repository-url>
cd ARS
Setup Agents
cd ars-agents
pip install -r requirements.txt

Run agent service:

uvicorn app.main:app --reload --port 6060
Setup Backend
cd ars-backend
pip install -r requirements.txt

Run backend server:

uvicorn main:app --reload --port 5050
Setup Frontend
cd ars-frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
Example Research Output

Input Topic

Retrieval Augmented Generation evaluation

Output Example

Key Points

Importance of grounding

Evaluation metrics

Baseline comparison

Hypotheses

H1: Retrieval grounding improves factual accuracy

H2: Validation reduces hallucinations

Experiments

Baseline vs RAG comparison

Validation agent ablation test

Results

+12% groundedness improvement

+18% validation success rate

Conclusion
RAG combined with validation produces more reliable outputs.

Tech Stack

Frontend
React
TailwindCSS
Vite

Backend
FastAPI
Python

Agent System
LangGraph
LangChain
OpenAI / Gemini

Infrastructure
Embeddings
Vector search
Retrieval pipelines

Future Improvements

Planned features include:

Real-time LangGraph streaming

Research paper ingestion

Automated literature review

Experiment visualization

Multi-LLM evaluation

Autonomous research loops

License

This project is for research and experimentation in agentic AI systems and automated research workflows.
