import requests
from bs4 import BeautifulSoup
from typing import Dict, List
import urllib.parse

def search(query: str) -> Dict:
    """Basic search function - placeholder for future implementation"""
    return {"query": query, "results": []}

def get_wikipedia_summary(topic: str) -> Dict:
    """Get summary information from Wikipedia for a given topic"""
    try:
        # Create Wikipedia API URL
        base_url = "https://en.wikipedia.org/api/rest_v1/page/summary/"
        encoded_topic = urllib.parse.quote(topic.replace(" ", "_"))
        url = base_url + encoded_topic

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        return {
            "title": data.get("title", topic),
            "summary": data.get("extract", ""),
            "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
            "source": "Wikipedia",
            "confidence": 0.9 if data.get("extract") else 0.0
        }
    except Exception as e:
        return {
            "title": topic,
            "summary": f"Could not retrieve Wikipedia information: {str(e)}",
            "url": "",
            "source": "Wikipedia",
            "confidence": 0.0
        }

def search_news(topic: str, max_results: int = 5) -> List[Dict]:
    """Search for recent news articles about a topic using DuckDuckGo"""
    try:
        # Use DuckDuckGo's HTML search (no API key required)
        search_url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(topic + ' news')}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        results = []

        # Parse DuckDuckGo results
        for result in soup.find_all('div', class_='result')[:max_results]:
            title_elem = result.find('a', class_='result__a')
            snippet_elem = result.find('a', class_='result__snippet')

            if title_elem and snippet_elem:
                title = title_elem.get_text().strip()
                url = title_elem.get('href', '')
                snippet = snippet_elem.get_text().strip()

                results.append({
                    "title": title,
                    "summary": snippet,
                    "url": url,
                    "source": "News",
                    "confidence": 0.7
                })

        return results
    except Exception as e:
        return [{
            "title": f"News search failed for {topic}",
            "summary": f"Could not retrieve news: {str(e)}",
            "url": "",
            "source": "News",
            "confidence": 0.0
        }]

def search_academic_papers(topic: str, max_results: int = 3) -> List[Dict]:
    """Search for academic papers using arXiv API"""
    try:
        # Use arXiv API (free and doesn't require API key)
        base_url = "http://export.arxiv.org/api/query"
        params = {
            "search_query": f"all:{topic}",
            "start": 0,
            "max_results": max_results,
            "sortBy": "relevance",
            "sortOrder": "descending"
        }

        response = requests.get(base_url, params=params, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'xml')
        results = []

        for entry in soup.find_all('entry'):
            title = entry.find('title').get_text().strip() if entry.find('title') else ""
            summary = entry.find('summary').get_text().strip() if entry.find('summary') else ""
            url = entry.find('id').get_text().strip() if entry.find('id') else ""

            if title and summary:
                # Truncate summary if too long
                if len(summary) > 300:
                    summary = summary[:300] + "..."

                results.append({
                    "title": title,
                    "summary": summary,
                    "url": url,
                    "source": "arXiv",
                    "confidence": 0.8
                })

        return results
    except Exception as e:
        return [{
            "title": f"Academic search failed for {topic}",
            "summary": f"Could not retrieve academic papers: {str(e)}",
            "url": "",
            "source": "arXiv",
            "confidence": 0.0
        }]

def general_web_search(query: str, max_results: int = 5) -> List[Dict]:
    """Perform general web search using DuckDuckGo"""
    try:
        search_url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(search_url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        results = []

        for result in soup.find_all('div', class_='result')[:max_results]:
            title_elem = result.find('a', class_='result__a')
            snippet_elem = result.find('a', class_='result__snippet')

            if title_elem and snippet_elem:
                title = title_elem.get_text().strip()
                url = title_elem.get('href', '')
                snippet = snippet_elem.get_text().strip()

                results.append({
                    "title": title,
                    "summary": snippet,
                    "url": url,
                    "source": "Web",
                    "confidence": 0.6
                })

        return results
    except Exception as e:
        return [{
            "title": f"Web search failed for {query}",
            "summary": f"Could not perform web search: {str(e)}",
            "url": "",
            "source": "Web",
            "confidence": 0.0
        }]

def comprehensive_research(topic: str) -> Dict:
    """Perform comprehensive research across multiple sources"""
    try:
        # Gather information from multiple sources
        wikipedia_info = get_wikipedia_summary(topic)
        news_results = search_news(topic, 3)
        academic_results = search_academic_papers(topic, 2)
        web_results = general_web_search(topic, 3)

        # Combine all results
        all_sources = []

        # Add Wikipedia if we got good results
        if wikipedia_info.get("confidence", 0) > 0.5:
            all_sources.append(wikipedia_info)

        # Add news results
        all_sources.extend(news_results)

        # Add academic results
        all_sources.extend(academic_results)

        # Add general web results
        all_sources.extend(web_results)

        return {
            "topic": topic,
            "sources": all_sources,
            "total_sources": len(all_sources),
            "research_summary": f"Found {len(all_sources)} sources of information about {topic}"
        }
    except Exception as e:
        return {
            "topic": topic,
            "sources": [{
                "title": f"Research failed for {topic}",
                "summary": f"Could not perform comprehensive research: {str(e)}",
                "url": "",
                "source": "Error",
                "confidence": 0.0
            }],
            "total_sources": 1,
            "research_summary": f"Research failed: {str(e)}"
        }