from tools.llm_tool import think


def write_section(title, content):

    prompt = f"""
Write academic research paper section.

SECTION: {title}

CONTENT:
{content}

Rules:
- clear academic tone
- no repetition
- realistic writing
- concise but detailed
"""

    return think(prompt)


def generate_report(goal, hypothesis, findings):

    title = think(f"Write a strong academic research paper title about: {goal}")

    abstract = write_section(
        "Abstract",
        f"Goal: {goal}\nHypothesis: {hypothesis}\nFindings: {findings}"
    )

    intro = write_section(
        "Introduction",
        f"Explain importance of {goal} and research motivation."
    )

    methodology = write_section(
        "Methodology",
        f"Hypothesis: {hypothesis}"
    )

    results = write_section(
        "Results",
        findings
    )

    discussion = write_section(
        "Discussion",
        f"Interpret findings: {findings}"
    )

    conclusion = write_section(
        "Conclusion",
        f"Summarize contribution of {goal}"
    )

    return f"""
📄 GENERATED RESEARCH PAPER

Title:
{title}

Abstract:
{abstract}

Introduction:
{intro}

Methodology:
{methodology}

Results:
{results}

Discussion:
{discussion}

Conclusion:
{conclusion}
"""