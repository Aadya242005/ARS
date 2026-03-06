import random

def run_experiment(exp):

    return {
        "accuracy": round(random.uniform(0.7, 0.95), 3),
        "loss": round(random.uniform(0.2, 0.4), 3)
    }