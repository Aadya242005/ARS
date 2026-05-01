import os
import time
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

XAI_API_KEY = os.getenv("XAI_API_KEY")
if not XAI_API_KEY:
    raise RuntimeError("XAI_API_KEY environment variable is not set. Please set it in .env or export it.")

client = OpenAI(api_key=XAI_API_KEY, base_url="https://api.groq.com/openai/v1")


import re
import random

def llm_call(messages: list, model: str = "llama-3.1-8b-instant", max_tokens: int = 1200, temperature: float = 0.5, **kwargs):
    """
    Wrapper around client.chat.completions.create with automatic retry
    on 429 rate-limit errors (uses recommended wait time if provided).
    """
    max_retries = 6
    delays = [2, 5, 10, 20, 40, 60] 
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs
            )
            return response
        except Exception as e:
            err_msg = str(e)
            err_lower = err_msg.lower()
            
            if "429" in err_lower or "rate_limit" in err_lower or "tokens" in err_lower:
                # Try to extract wait time (e.g., "Please try again in 5.18s")
                wait_time = 0
                match = re.search(r"try again in (\d+\.?\d*)s", err_lower)
                if match:
                    wait_time = float(match.group(1)) + 0.5 # Add small buffer
                else:
                    # Fallback to predefined delays
                    wait_time = delays[min(attempt, len(delays)-1)] + random.uniform(0.5, 2.0)
                
                if attempt < max_retries - 1:
                    print(f"[llm_call] Rate limit hit ({model}). Waiting {wait_time:.1f}s... (attempt {attempt + 1})")
                    time.sleep(wait_time)
                    continue
            
            print(f"[llm_call] Final error: {err_msg}")
            raise
            
    # One last attempt if we somehow exit the loop
    return client.chat.completions.create(
        model=model,
        messages=messages,
        max_tokens=max_tokens,
        temperature=temperature,
        **kwargs
    )
