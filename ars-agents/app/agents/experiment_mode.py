"""
Experiment Mode Agent
=====================
This agent suggests research experiments based on problem statements.
It recommends datasets, approaches, and expected outputs to help users
design their experiments like a real scientist.
"""

import json
from datetime import datetime
from ..client import client, llm_call


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
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a research scientist. Suggest 3 experiment approaches for the given problem in {domain}. Return ONLY a JSON array of objects with: approach, approach_description (2 sentences), dataset, dataset_url, expected_output, difficulty (beginner/intermediate/advanced), estimated_time."
                },
                {
                    "role": "user",
                    "content": f"Problem: {problem_statement}"
                }
            ],
            max_tokens=600,
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
            "success": True,
            "problem": problem_statement,
            "domain": domain,
            "suggestions": validated,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except json.JSONDecodeError as e:
        # Fallback suggestions if JSON parsing fails
        return {
            "success": True,
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

def analyze_suggestion(problem: str, suggestion: dict, domain: str = "AI") -> dict:
    """
    Perform deep-dive analysis of a specific experiment suggestion,
    including pros/cons, visualization plan, and Python code.
    """
    try:
        response = llm_call(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": f"You are an expert scientist. Analyze the suggestion for the problem in {domain}. Be extremely concise. Return ONLY a JSON object with: analysis (1 paragraph), pros (list of 3), cons (list of 3), visualization_plan (list of 2), image_keywords (list of 3), code (concise Python baseline script)."
                },
                {
                    "role": "user",
                    "content": f"Problem: {problem}\nSuggestion: {suggestion.get('approach')}"
                }
            ],
            max_tokens=800,
            temperature=0.4
        )
        
        response_text = response.choices[0].message.content.strip()
        cleaned = response_text
        if cleaned.startswith("```"):
            parts = cleaned.split("```")
            for part in parts:
                if part.strip().startswith("{"):
                    cleaned = part.strip()
                    break
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
            
        analysis_data = json.loads(cleaned)
        
        return {
            "analysis": analysis_data.get("analysis", ""),
            "pros": analysis_data.get("pros", []),
            "cons": analysis_data.get("cons", []),
            "visualization_plan": analysis_data.get("visualization_plan", []),
            "image_keywords": analysis_data.get("image_keywords", []),
            "preview_image_url": "/static/plots/research_preview.png",
            "code": analysis_data.get("code", "# Python code placeholder"),
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "error": f"Failed to analyze suggestion: {str(e)}",
            "analysis": "Analysis failed due to an error.",
            "code": "# Error generating code"
        }