from transformers import pipeline

print("🧠 Loading Research Brain (FINAL MODE)...")

llm = pipeline(
    "text2text-generation",
    model="google/flan-t5-large",
    device=-1
)

def think(prompt):

    prompt = prompt[:1800]   # prevent overflow

    output = llm(
        prompt,
        max_new_tokens=400,   # IMPORTANT
        do_sample=True,
        temperature=0.6
    )

    return output[0]["generated_text"].strip()