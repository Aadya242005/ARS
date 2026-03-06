from tools.llm_tool import think

def evaluate(hypothesis, analysis):

    prompt = f"""
Evaluate quality (0–1 score)

Hypothesis:
{hypothesis}

Results:
{analysis}
"""

    return think(prompt)