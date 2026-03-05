# 🔬 ARS Real-Time Research System - Setup Guide

## Overview

The ARS system runs a **live 7-agent research cycle** on any topic you search for. Real agents execute in sequence, each calling OpenAI's API to perform actual research.

```
User Search → Backend Receives Topic → 7 Agents Run In Sequence → Real-Time Streaming → Results
    ↓               ↓                          ↓                          ↓                ↓
"Quantum"    /api/research/topic    Knowledge → Hypothesis →      Live event stream   Knowledge
Computing                          Experiment → Execution →      in browser logs     Hypotheses
                                   Analysis → Validation →                          Experiments
                                   Learning                                         Results
```

---

## System Architecture

### **3 Main Services:**

| Service | Port | Purpose | Technology |
|---------|------|---------|-----------|
| **ars-backend** | 5050 | Chat API + Document management | FastAPI + OpenAI |
| **ars-agents** | 8000 | Real agentic research cycle | LangGraph + FastAPI |
| **ars-frontend** | 5173 | Web UI for search & results | React + Vite |

---

## 🚀 Quick Start (Recommended)

### **Option 1: Run Everything at Once**

```powershell
# From workspace root directory
cd c:\Users\Dell\Desktop\ARS
.\START_ALL.ps1
```

This starts all 3 services in separate terminal windows.

---

### **Option 2: Manual Start (Step by Step)**

#### **Step 1: Start Backend Service (port 5050)**
```powershell
cd c:\Users\Dell\Desktop\ARS\ars-backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5050
```
✅ You should see: `Application startup complete`

#### **Step 2: Start Agents Service (port 8000)** [NEW WINDOW]
```powershell
cd c:\Users\Dell\Desktop\ARS\ars-agents
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
✅ You should see: `Application startup complete`

#### **Step 3: Start Frontend** [NEW WINDOW]
```powershell
cd c:\Users\Dell\Desktop\ARS\ars-frontend
npm run dev
```
✅ You should see: `Local: http://localhost:5173`

---

## 🔍 Using the System

### **Basic Research Flow**

1. **Open Browser**
   - Go to `http://localhost:5173` (or `http://localhost:3000`)
   - Wait for page to load

2. **Navigate to Search Research**
   - Click **"Search Research"** in navbar
   - You'll see the search page with a search bar

3. **Enter a Topic**
   - Type any topic you want researched:
     - "Retrieval-Augmented Generation"
     - "Quantum Computing"
     - "Gene Therapy"
     - "Climate Change Solutions"
     - "Any topic you're curious about"

4. **Click Research**
   - Click the **"Research"** button (or press Enter)
   - Watch the **Live Research Log** on the right update in real-time!

5. **View Results**
   - As agents complete, results appear in tabs:
     - **Overview** - Quick summary
     - **Knowledge** - Key insights extracted
     - **Hypotheses** - Testable hypotheses generated
     - **Experiments** - Experiment designs with metrics
     - **Validation** - Quality checks & confidence scores
     - **Learning** - Best practices, next steps, risks

---

## 📊 What Happens In Real-Time

When you search a topic, here's the exact sequence:

```
Phase 1: Knowledge Agent
  └─ Calls OpenAI to extract key concepts
  └─ Logs: "Knowledge agent running..."
  └─ Results: 3-5 key insights with confidence scores
  
Phase 2: Hypothesis Agent  
  └─ Calls OpenAI to generate testable hypotheses
  └─ Logs: "Hypothesis agent running..."
  └─ Results: Hypotheses with predictions
  
Phase 3: Experiment Agent
  └─ Calls OpenAI to design experiments to test hypotheses
  └─ Logs: "Experiment agent running..."
  └─ Results: Experiment designs with success criteria
  
Phase 4: Execution Agent
  └─ Calls OpenAI to run/simulate experiments
  └─ Logs: "Execution agent running..."
  └─ Results: Experiment results & metrics
  
Phase 5: Analysis Agent
  └─ Calls OpenAI to analyze results
  └─ Logs: "Analysis agent running..."
  └─ Results: Patterns, conclusions, insights
  
Phase 6: Validation Agent
  └─ Calls OpenAI to validate findings
  └─ Logs: "Validation agent running..."
  └─ Results: Pass/fail checks on research quality
  
Phase 7: Learning Agent
  └─ Calls OpenAI to synthesize learnings
  └─ Logs: "Learning agent running..."
  └─ Results: Best practices, next steps, risks
```

---

## 🐛 Troubleshooting

### **Error: "No routes matched location /search"**
→ Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

### **Error: "Failed to connect to http://localhost:8000"**
→ Agents service not running
```powershell
# In new terminal:
cd c:\Users\Dell\Desktop\ARS\ars-agents
python -m uvicorn app.main:app --reload --port 8000
```

### **Error: "OPENAI_API_KEY missing"**
→ Check `.env` file exists in both:
- `c:\Users\Dell\Desktop\ARS\ars-backend\.env`
- `c:\Users\Dell\Desktop\ARS\ars-agents\.env`

Should contain: `OPENAI_API_KEY=sk-...`

### **Error: "You exceeded your current quota"**
→ OpenAI account billing issue
- Visit: https://platform.openai.com/account/billing/overview
- Add payment method or upgrade plan
- Wait 5-10 minutes for activation

---

## 📝 Example: Research "Quantum Computing"

```
User Input: "Quantum Computing"
    ↓
Backend receives: POST /api/research/topic {"topic": "Quantum Computing"}
    ↓
Agents start running:

[1] Knowledge Agent
    "Extracted 5 key concepts: qubits, superposition, entanglement, quantum gates, measurement collapse"
    
[2] Hypothesis Agent
    "H1: Quantum computers outperform classical for optimization problems"
    "H2: Error correction is the limiting factor for practical quantum computing"
    
[3] Experiment Agent
    "Design experiment comparing quantum vs classical solvers on TSP"
    
[4] Execution Agent
    "Simulated 100 test cases: Quantum 15% faster for medium problems"
    
[5] Analysis Agent
    "Pattern: Advantage increases with problem complexity"
    
[6] Validation Agent
    "✓ Methodology sound, ✓ Data consistent, ✓ Ready for publication"
    
[7] Learning Agent
    "Best practice: Start with small NISQ devices, focus on near-term applications"
    
Results displayed in UI with tabs for each phase
```

---

## 🔧 Configuration

### **Ports**
- Change in each service's startup command:
  ```powershell
  --port 5050    # Change ars-backend port
  --port 8000    # Change ars-agents port
  # Frontend uses vite.config.js
  ```

### **Model**
- Edit agent files to use different OpenAI model:
  ```python
  # In ars-agents/app/agents/*.py
  response = client.chat.completions.create(
      model="gpt-4-turbo",  # ← Change to gpt-3.5-turbo or gpt-4
      ...
  )
  ```

### **Max Research Time**
- Each agent has ~30 second timeout
- Change in `ars-agents/app/main.py` if needed

---

## ✅ Verification Checklist

- [ ] All .env files have OPENAI_API_KEY
- [ ] OpenAI account has active billing
- [ ] All 3 services started successfully
- [ ] Browser can access http://localhost:5173
- [ ] "Search Research" appears in navbar
- [ ] Can type topic and search
- [ ] Live log updates as agents run
- [ ] Results appear in tabs

---

## 📞 Support

If something doesn't work:

1. **Check terminal output** - Error messages tell you what's wrong
2. **Verify all 3 services are running** - Check each terminal
3. **Hard refresh browser** - Ctrl+Shift+R
4. **Check .env files** - Make sure API key is set
5. **Check OpenAI billing** - Make sure account is funded

---

## 🎉 You're Ready!

The system is now ready for **real-time agentic research**. Search any topic and watch the 7-agent cycle conduct live research with actual OpenAI API calls!

