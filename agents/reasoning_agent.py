from tools.llm_tool import think

def generate_hypothesis(goal, knowledge):

    prompt = f"""
Goal: {goal}

Knowledge:
{knowledge}

Generate one scientific hypothesis.
"""

    return think(prompt)