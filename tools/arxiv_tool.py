import arxiv
import time


def fetch_papers(query):

    try:
        search = arxiv.Search(
            query=query,
            max_results=3,   # ✅ reduce requests
            sort_by=arxiv.SortCriterion.Relevance
        )

        papers = []

        for result in search.results():
            summary = result.summary.replace("\n", " ")
            papers.append(summary[:700])

        return papers

    except Exception:

        print("⚠️ arXiv blocked request — using fallback knowledge")

        # ✅ fallback knowledge (VERY IMPORTANT)
        return [
            "Neural architecture search (NAS) automates neural network design using reinforcement learning, evolutionary algorithms, and gradient-based optimization. Recent work focuses on efficiency through weight sharing and search space reduction.",
            "Efficient NAS methods reduce computational cost by proxy tasks, parameter sharing, and differentiable search strategies such as DARTS."
        ]