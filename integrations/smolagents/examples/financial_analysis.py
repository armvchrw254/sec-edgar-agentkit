#!/usr/bin/env python3
"""Financial analysis example using SEC EDGAR agentkit with smolagents."""

from sec_edgar_smolagents import create_sec_edgar_agent


def analyze_company_financials(company_name: str, years: int = 3):
    """Analyze a company's financial performance over time."""
    
    # Create agent
    agent = create_sec_edgar_agent("gpt-4")
    
    print(f"\n=== Financial Analysis for {company_name} ===\n")
    
    # Multi-step analysis
    prompts = [
        f"Find the CIK for {company_name}",
        f"Get the last {years} years of 10-K filings for this company",
        f"Extract revenue and net income from each 10-K filing",
        f"Calculate the year-over-year growth rates",
        f"Analyze any significant changes in the financial performance"
    ]
    
    for i, prompt in enumerate(prompts, 1):
        print(f"Step {i}: {prompt}")
        result = agent.run(prompt)
        print(f"Result: {result}\n")
        print("-" * 50)


def compare_companies(companies: list):
    """Compare financial metrics across multiple companies."""
    
    agent = create_sec_edgar_agent("gpt-4")
    
    print(f"\n=== Comparing Companies: {', '.join(companies)} ===\n")
    
    # Comparison analysis
    comparison_prompt = f"""
    Compare the following companies based on their latest 10-K filings:
    {', '.join(companies)}
    
    For each company, extract:
    1. Total revenue
    2. Net income
    3. Gross margin
    4. Operating margin
    
    Then provide a brief analysis of which company appears to be performing better financially.
    """
    
    result = agent.run(comparison_prompt)
    print(f"Comparison Result:\n{result}")


def insider_trading_analysis(company: str):
    """Analyze insider trading patterns for a company."""
    
    agent = create_sec_edgar_agent("gpt-4")
    
    print(f"\n=== Insider Trading Analysis for {company} ===\n")
    
    prompt = f"""
    Analyze insider trading activity for {company} over the last 6 months.
    Look at Form 4 filings and identify:
    1. Total insider purchases vs sales
    2. Notable transactions by executives
    3. Any patterns or trends in insider trading
    4. What this might indicate about insider sentiment
    """
    
    result = agent.run(prompt)
    print(f"Analysis:\n{result}")


if __name__ == "__main__":
    # Example 1: Single company analysis
    analyze_company_financials("Apple Inc.", years=3)
    
    # Example 2: Compare competitors
    compare_companies(["Microsoft", "Google", "Amazon"])
    
    # Example 3: Insider trading
    insider_trading_analysis("Tesla")