from agents.planner_agent import plan_research
from agents.knowledge_agent import gather_knowledge
from agents.reasoning_agent import generate_hypothesis
from agents.experiment_agent import design_experiment
from agents.execution_agent import run_experiment
from agents.analysis_agent import analyze_results
from agents.critic_agent import critique
from agents.evaluation_agent import evaluate
from agents.evolution_agent import improve
from agents.report_agent import generate_report


def research_loop(goal):

    print("\n🚀 Autonomous Research Scientist Started\n")

    plan = plan_research(goal)

    knowledge = gather_knowledge(goal)

    hypothesis = generate_hypothesis(goal, knowledge)

    for i in range(3):

        print(f"\n===== ITERATION {i+1} =====")

        experiment = design_experiment(hypothesis)
        results = run_experiment(experiment)
        analysis = analyze_results(results)

        feedback = critique(hypothesis, analysis)
        score = evaluate(hypothesis, analysis)

        hypothesis = improve(hypothesis, feedback)

    print("\n✅ FINAL DISCOVERY\n")

    paper = generate_report(goal, hypothesis, analysis)

    print("\n📄 GENERATED RESEARCH PAPER\n")
    print(paper)