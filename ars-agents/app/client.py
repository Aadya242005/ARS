import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI


env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    raise RuntimeError("XAI_API_KEY environment variable is not set. Please set it in .env or export it.")

client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.groq.com/openai/v1")
