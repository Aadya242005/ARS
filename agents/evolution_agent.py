from tools.llm_tool import think

def improve(hypothesis, feedback):

    prompt = f"""
Improve this scientific hypothesis.

OLD HYPOTHESIS:
{hypothesis}

FEEDBACK:
{feedback}

Write improved version only.
"""

    return think(prompt)