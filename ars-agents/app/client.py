import os
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import time


env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)


XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    raise RuntimeError("XAI_API_KEY environment variable is not set. Please set it in .env or export it.")

client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.groq.com/openai/v1")

# Monkey-patch create method to add fallback
original_create = client.chat.completions.create

def create_with_fallback(*args, **kwargs):
    max_retries = 3
    base_wait = 1.5
    
    for attempt in range(max_retries):
        try:
            return original_create(*args, **kwargs)
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate_limit" in error_str or "tokens" in error_str:
                if attempt == max_retries - 1:
                    raise e
                print(f"Rate limit hit for {kwargs.get('model', 'unknown model')} on attempt {attempt+1}. Waiting {base_wait}s and trying llama-3.1-8b-instant...")
                kwargs["model"] = "llama-3.1-8b-instant"
                time.sleep(base_wait)
                base_wait *= 2
            else:
                raise e

client.chat.completions.create = create_with_fallback
