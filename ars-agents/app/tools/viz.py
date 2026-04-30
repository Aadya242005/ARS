import matplotlib.pyplot as plt
import os
from typing import List, Dict

def generate_experiment_plots(results: List[Dict], run_id: str) -> str:
    """
    Generate a bar plot for experiment results and save it as an image.
    Returns the path to the saved image.
    """
    if not results:
        return ""

    # Ensure static directory exists
    static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "plots")
    os.makedirs(static_dir, exist_ok=True)

    ids = [r.get("experiment_id", "???") for r in results]
    values = [r.get("metric_value", 0.0) for r in results]
    baselines = [r.get("baseline", 0.0) for r in results]
    
    # Create the plot
    plt.figure(figsize=(10, 6))
    x = range(len(ids))
    width = 0.35

    plt.bar([i - width/2 for i in x], baselines, width, label='Baseline', color='#A0AEC0')
    plt.bar([i + width/2 for i in x], values, width, label='Result', color='#4299E1')

    plt.xlabel('Experiment ID')
    plt.ylabel('Metric Value')
    plt.title(f'Research Results - {run_id}')
    plt.xticks(x, ids)
    plt.legend()
    plt.grid(axis='y', linestyle='--', alpha=0.7)

    # Save the plot
    plot_filename = f"plot_{run_id}.png"
    plot_path = os.path.join(static_dir, plot_filename)
    plt.savefig(plot_path)
    plt.close()

    return f"/static/plots/{plot_filename}"
