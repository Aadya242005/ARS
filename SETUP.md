# ARS RAG + LLM Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd ars-backend
pip install -r requirements.txt
```

**Agents:**
```bash
cd ars-agents/app
pip install -r requirements.txt
```

### 2. Environment Setup

Create `.env` files in both `ars-backend/` and `ars-agents/app/`:

**ars-backend/.env:**
```
OPENAI_API_KEY=sk-your-key-here
```

**ars-agents/app/.env:**
```
OPENAI_API_KEY=sk-your-key-here
BACKEND_URL=http://localhost:5050
```

### 3. Start Services

**Terminal 1 - Backend (Doc Storage + Retrieval):**
```bash
cd ars-backend
uvicorn main:app --reload --port 5050
```

**Terminal 2 - Agentic Service:**
```bash
cd ars-agents/app
uvicorn main:app --reload --port 8000
```

**Terminal 3 - Frontend (optional):**
```bash
cd ars-frontend
npm run dev
```

### 4. Upload Documents

Before running agents, upload research documents via the backend:

```bash
curl -X POST "http://localhost:5050/api/docs/upload" \
  -F "file=@path/to/your/document.txt"
```

Or use the frontend to upload via UI.

### 5. Run Research Pipeline

```bash
curl -X POST "http://localhost:8000/api/runs" \
  -H "Content-Type: application/json" \
  -d '{"goal": "Analyze effects of X on Y", "mode": "full"}'
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│  - Upload documents                                  │
│  - Monitor agent progress real-time                  │
│  - View results (knowledge, hypotheses, etc)         │
└─────────────┬───────────────────────────────────────┘
              │
        ┌─────┴──────┬──────────────────┐
        │            │                  │
┌───────▼────────┐  │         ┌────────▼──────────┐
│  Backend API   │  │         │ Agentic Service   │
│ (Port 5050)    │  │         │  (Port 8000)      │
├────────────────┤  │         ├───────────────────┤
│ POST /docs/    │  │         │ Knowledge Agent   │
│  upload        │  │◄────────┤ (RAG + OpenAI)    │
│ POST /docs/    │  │         │                   │
│  retrieve      │  │         │ Hypothesis Agent  │
│                │  │         │ (LLM reasoning)   │
│ [SQLite + ✓]   │  │         │                   │
│  Embeddings    │  │         │ Experiment Agent  │
│ [OpenAI]       │  │         │ (Design)          │
└────────────────┘  │         │                   │
                    │         │ Validation Agent  │
                    │         │ (Sanity checks)   │
                    │         └───────────────────┘
                    │
                    └─ SSE Streaming (real-time updates)
```

## Data Flow

1. **Upload Phase**: Documents → Backend SQLite + Embeddings
2. **Retrieval Phase**: Query → Top-K Chunks (semantic similarity)
3. **Knowledge Agent**: Retrieve → Summarize + Extract (OpenAI)
4. **Hypothesis Agent**: Knowledge → Generate Hypotheses (OpenAI)
5. **Experiment Agent**: Hypotheses → Design Experiments (OpenAI)
6. **Validation Agent**: Full Plan → Sanity Checks (OpenAI)

## API Endpoints

### Backend (Port 5050)

- `GET /` - Health check
- `POST /api/docs/upload` - Upload & chunk document
- `POST /api/docs/retrieve` - Retrieve top-K chunks

**Retrieve Request:**
```json
{
  "query": "What are the main constraints?",
  "top_k": 5
}
```

**Retrieve Response:**
```json
{
  "query": "...",
  "chunks": [
    {
      "chunk_id": 1,
      "doc_name": "research.txt",
      "text": "...",
      "score": 0.92
    }
  ]
}
```

### Agentic Service (Port 8000)

- `POST /api/runs` - Start research pipeline
- `GET /api/runs/{run_id}` - Get run state
- `GET /api/runs/{run_id}/stream` - Stream SSE events

## Testing

**Test Backend:**
```bash
# Upload test doc
echo "Machine learning increases accuracy by 25% in medical imaging." > test.txt
curl -X POST "http://localhost:5050/api/docs/upload" -F "file=@test.txt"

# Test retrieval
curl -X POST "http://localhost:5050/api/docs/retrieve" \
  -H "Content-Type: application/json" \
  -d '{"query": "accuracy medical", "top_k": 3}'
```

**Test Agents:**
```bash
# Start a run
curl -X POST "http://localhost:8000/api/runs" \
  -H "Content-Type: application/json" \
  -d '{"goal": "Improve model accuracy", "mode": "full"}'

# Check status
curl "http://localhost:8000/api/runs/run_1234567890"
```

## Troubleshooting

**Missing OPENAI_API_KEY:**
- Check `.env` files in both backends
- Ensure key starts with `sk-`
- Restart services after updating

**No documents retrieved:**
- Upload docs first via `/api/docs/upload`
- Check SQLite database: `sqlite3 ars-backend/docs.db "SELECT COUNT(*) FROM chunks;"`

**LLM errors:**
- Verify OpenAI API key is valid
- Check token limits (GPT-4-turbo has 128K context)
- Monitor usage on platform.openai.com

**Connection refused:**
- Ensure backend (5050) is running before agents (8000)
- Update `BACKEND_URL` in `.env` if backend is on different host

## Next Steps

1. ✅ RAG + OpenAI core infrastructure deployed
2. 📊 Add metrics tracking (F1, BLEU, etc.)
3. 🔄 Implement experiment execution harness
4. 📈 Add result visualization & comparison
5. 🚀 Deploy to cloud (Azure/AWS)
