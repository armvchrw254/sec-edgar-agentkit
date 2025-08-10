#!/usr/bin/env python3
"""Basic usage example of SEC EDGAR agentkit with smolagents."""

import asyncio
from sec_edgar_smolagents import create_sec_edgar_agent, CIKLookupTool, FilingSearchTool


async def main():
    """Run basic SEC EDGAR agent examples."""
    
    # Create an agent with all SEC EDGAR tools
    agent = create_sec_edgar_agent("gpt-4")
    
    print("=== SEC EDGAR Agent Examples ===\n")
    
    # Example 1: Company lookup
    print("1. Looking up Apple's information...")
    result = agent.run("Find Apple's CIK and get their basic company information")
    print(f"Result: {result}\n")
    
    # Example 2: Recent filings
    print("2. Searching for Microsoft's recent 10-K filings...")
    result = agent.run("Show me Microsoft's recent 10-K filings from the last 2 years")
    print(f"Result: {result}\n")
    
    # Example 3: Financial analysis
    print("3. Analyzing Tesla's financials...")
    result = agent.run(
        "Get Tesla's latest financial statements and tell me their revenue and net income"
    )
    print(f"Result: {result}\n")
    
    # Example 4: 8-K events
    print("4. Checking for material events...")
    result = agent.run(
        "Find any recent 8-K filings for NVIDIA and summarize the material events"
    )
    print(f"Result: {result}\n")
    
    # Example 5: Using specific tools
    print("5. Using specific tools directly...")
    
    # Create agent with only specific tools
    lookup_tool = CIKLookupTool()
    filing_tool = FilingSearchTool()
    
    specific_agent = create_sec_edgar_agent(
        "gpt-4",
        tools=[lookup_tool, filing_tool]
    )
    
    result = specific_agent.run("Find Amazon's CIK and their latest quarterly report")
    print(f"Result: {result}\n")


if __name__ == "__main__":
    asyncio.run(main())