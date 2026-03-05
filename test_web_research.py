#!/usr/bin/env python3
"""Test script to verify web research functionality"""

import sys
import os

# Add ars-agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ars-agents'))

from app.tools.web import comprehensive_research, get_wikipedia_summary, search_news
import json

def main():
    print("Testing web research module...")
    print("-" * 50)
    
    # Test 1: Wikipedia summary
    print("\n1. Testing Wikipedia summary for 'Python Programming':")
    result = get_wikipedia_summary("Python Programming")
    print(json.dumps(result, indent=2)[:500])
    
    # Test 2: News search
    print("\n2. Testing news search for 'AI':")
    result = search_news("AI", max_results=2)
    print(f"Found {len(result)} news articles")
    if result:
        print(json.dumps(result[0], indent=2)[:300])
    
    # Test 3: Comprehensive research
    print("\n3. Testing comprehensive research for 'climate change':")
    result = comprehensive_research("climate change")
    print(f"Total sources found: {result.get('total_sources', 0)}")
    print(f"Research summary: {result.get('research_summary', '')}")
    print(f"Source types: {[s.get('source') for s in result.get('sources', [])][:5]}")
    
    print("\n✓ Web research module is working!")

if __name__ == "__main__":
    main()
