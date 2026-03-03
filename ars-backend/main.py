import os
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# configure simple logging to console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# load the key from environment using the variable name string
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    # make startup error more descriptive
    raise RuntimeError("GEMINI_API_KEY missing in environment; set it in .env or export it")

# log that we have a key (don't print actual key for security)
logger.info("loaded GEMINI_API_KEY, length=%d", len(API_KEY))

# configure the SDK
genai.configure(api_key=API_KEY)

app = FastAPI(title="Cognova Backend", version="1.0")

# React dev server (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatReq(BaseModel):
    message: str
    history: list[dict] = []  # [{role:"user"/"assistant", text:"..."}]

@app.get("/")
def health():
    return {"status": "ok", "app": "Cognova Backend"}

@app.post("/api/chat")
def chat(req: ChatReq):
    logger.info("incoming chat: %s", req.message)
    try:
        # allow overriding a preferred model via env var, fall back to a known chat-capable one
        model_name = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
        logger.info("using model %s", model_name)
        model = genai.GenerativeModel(model_name)

        gemini_history = []
        for h in req.history[-10:]:
            role = h.get("role", "")
            text = h.get("text", "")
            if not text:
                continue
            gemini_history.append({
                "role": "user" if role == "user" else "model",
                "parts": [{"text": text}]
            })

        session = model.start_chat(history=gemini_history)
        resp = session.send_message(req.message)

        logger.info("got reply of length %d", len(resp.text or ""))
        return {"reply": resp.text}

    except Exception as e:
        logger.exception("error during chat call")
        raise HTTPException(status_code=500, detail=str(e))

# helper endpoint for debugging available models
@app.get("/api/models")
def models():
    try:
        names = [m.name for m in genai.list_models()]
        return {"models": names}
    except Exception as e:
        logger.exception("failed to list models")
        raise HTTPException(status_code=500, detail=str(e))