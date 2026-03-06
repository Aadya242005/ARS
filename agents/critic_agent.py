from tools.llm_tool import think

def critique(hypothesis, analysis):

    prompt = f"""
Hypothesis:
{hypothesis}

Results:
{analysis}

Give weaknesses briefly.
"""

    return think(prompt)