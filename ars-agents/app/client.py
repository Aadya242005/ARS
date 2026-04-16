import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI


env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Initialize OpenAI client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY environment variable is not set. Please set it in .env or export it.")

client = OpenAI(api_key=OPENAI_API_KEY)
