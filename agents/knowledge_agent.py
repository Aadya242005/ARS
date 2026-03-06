from tools.arxiv_tool import fetch_papers

def gather_knowledge(goal):

    print("📚 Reading Scientific Papers")

    papers = fetch_papers(goal)

    # ✅ keep short summaries only
    short_papers = []

    for paper in papers[:2]:
        short_papers.append(paper[:600])   # LIMIT SIZE (VERY IMPORTANT)

    return " ".join(short_papers)