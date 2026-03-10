import os
import json
from openai import OpenAI

# testing 
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
text = "This is a test chunk for embedding."

try:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    print("Embedding successful, length:", len(response.data[0].embedding))
except Exception as e:
    print("Embedding failed:", e)