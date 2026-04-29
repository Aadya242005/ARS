"""
Experiment Mode Agent
=====================
This agent suggests research experiments based on problem statements.
It recommends datasets, approaches, and expected outputs to help users
design their experiments like a real scientist.
"""

import json
from datetime import datetime
from ..client import client


def suggest_experiment(problem_statement: str, domain: str = "AI") -> dict:
    """
    Generate experiment suggestions for a given problem statement.
    
    Args:
        problem_statement: The research problem to solve
        domain: The domain area (AI, Biology, Physics, etc.)
    
    Returns:
        Dictionary with problem, domain, and suggestions
    """
    
    # Domain-specific context for better suggestions
    domain_context = {
        "AI": "Focus on machine learning, deep learning, NLP, computer vision, and LLM applications.",
        "Biology": "Focus on molecular biology, genetics, bioinformatics, and biomedical research.",
        "Physics": "Focus on theoretical physics, quantum mechanics, astrophysics, and materials science.",
        "Chemistry": "Focus on organic chemistry, materials chemistry, computational chemistry, and biochemistry.",
        "Medicine": "Focus on clinical research, drug discovery, medical imaging, and health informatics.",
        "general": "Focus on data-driven research, statistical analysis, and empirical methods."
    }
    
    context = domain_context.get(domain, domain_context["general"])
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": f"""You are an expert research scientist and experiment designer. 
Your task is to suggest complete experiment setups for research problems.

For each suggestion, provide:
1. approach: A specific ML/AI technique or methodology (e.g., "NLP + BERT", "CNN + ResNet50", "Transformer + GPT")
2. approach_description: Brief explanation of why this approach fits the problem (2-3 sentences)
3. dataset: Name of a suitable public dataset
4. dataset_url: URL or source for the dataset
5. expected_output: What the experiment should produce (e.g., "classification model", "prediction system", "detector")
6. difficulty: One of [beginner, intermediate, advanced] based on complexity
7. estimated_time: Realistic time estimate (e.g., "2-4 hours", "1-2 days", "1 week")

Return ONLY a valid JSON array with 3 suggestions, no markdown, no code blocks.
Each suggestion should be realistic and actionable."""
                },
                {
                    "role": "user",
                    "content": f"""Domain: {domain}
Context for {domain}: {context}

Problem Statement: {problem_statement}

Suggest 3 different experiment approaches that a researcher could use to tackle this problem.
Each should be distinct and use different methodologies where possible.

Return as a JSON array with this exact structure:
[
  {{
    "approach": "...",
    "approach_description": "...",
    "dataset": "...",
    "dataset_url": "...",
    "expected_output": "...",
    "difficulty": "...",
    "estimated_time": "..."
  }},
  ...
]"""
                }
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        response_text = response.choices[0].message.content
        
        # Clean and parse JSON
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            parts = cleaned.split("```")
            for part in parts:
                if part.strip().startswith("["):
                    cleaned = part.strip()
                    break
        
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        
        suggestions = json.loads(cleaned)
        
        if not isinstance(suggestions, list):
            raise ValueError("Response is not a list")
        
        # Validate and normalize suggestions
        validated = []
        for i, s in enumerate(suggestions):
            validated.append({
                "approach": s.get("approach", f"Approach {i+1}"),
                "approach_description": s.get("approach_description", s.get("approachDescription", "")),
                "dataset": s.get("dataset", "Dataset to be determined"),
                "dataset_url": s.get("dataset_url", s.get("datasetUrl", "")),
                "expected_output": s.get("expected_output", s.get("expectedOutput", "Research model")),
                "difficulty": s.get("difficulty", "intermediate"),
                "estimated_time": s.get("estimated_time", s.get("estimatedTime", "To be determined"))
            })
        
        return {
            "problem": problem_statement,
            "domain": domain,
            "suggestions": validated,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except json.JSONDecodeError as e:
        # Fallback suggestions if JSON parsing fails
        return {
            "problem": problem_statement,
            "domain": domain,
            "suggestions": [
                {
                    "approach": "Data-driven approach",
                    "approach_description": "Start with exploratory data analysis and baseline models before advancing to complex methods.",
                    "dataset": "To be determined based on problem",
                    "dataset_url": "",
                    "expected_output": "Baseline model and analysis report",
                    "difficulty": "beginner",
                    "estimated_time": "1-2 days"
                },
                {
                    "approach": "ML/AI methodology",
                    "approach_description": "Apply machine learning techniques appropriate for the data type and problem structure.",
                    "dataset": "To be determined based on problem",
                    "dataset_url": "",
                    "expected_output": "Trained model with evaluation metrics",
                    "difficulty": "intermediate",
                    "estimated_time": "3-5 days"
                },
                {
                    "approach": "Advanced deep learning",
                    "approach_description": "Use state-of-the-art deep learning models for complex pattern recognition.",
                    "dataset": "To be determined based on problem",
                    "dataset_url": "",
                    "expected_output": "Production-ready deep learning system",
                    "difficulty": "advanced",
                    "estimated_time": "1-2 weeks"
                }
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise Exception(f"Failed to generate experiment suggestions: {str(e)}")