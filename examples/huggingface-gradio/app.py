import gradio as gr
import asyncio
from gradio_client import Client as GradioClient
from typing import Dict, Any, List
import json

# For Hugging Face Spaces deployment
import os
import sys

# Add the integration path for local testing
if os.path.exists('../../integrations/gradio'):
    sys.path.insert(0, '../../integrations/gradio')

# Configuration for MCP server
MCP_SERVER_URL = os.environ.get("MCP_SERVER_URL", "sec-edgar-mcp")

class SECEdgarGradioClient:
    """Client for interacting with SEC EDGAR data via Gradio interface"""
    
    def __init__(self):
        self.mcp_connected = False
        # In production, this would connect to the actual MCP server
        # For demo, we'll use mock data
        
    async def search_company(self, query: str) -> Dict[str, Any]:
        """Search for a company by name or ticker"""
        # Mock implementation for demo
        mock_data = {
            "AAPL": {"cik": "0000320193", "name": "Apple Inc.", "exchange": "NASDAQ"},
            "MSFT": {"cik": "0000789019", "name": "Microsoft Corporation", "exchange": "NASDAQ"},
            "GOOGL": {"cik": "0001652044", "name": "Alphabet Inc.", "exchange": "NASDAQ"},
            "TSLA": {"cik": "0001318605", "name": "Tesla, Inc.", "exchange": "NASDAQ"},
        }
        
        query_upper = query.upper()
        if query_upper in mock_data:
            return {"status": "success", "data": mock_data[query_upper]}
        
        # Search by name
        for ticker, info in mock_data.items():
            if query.lower() in info["name"].lower():
                return {"status": "success", "data": info}
        
        return {"status": "error", "message": "Company not found"}
    
    async def get_recent_filings(self, cik: str, form_type: str = None) -> List[Dict[str, Any]]:
        """Get recent filings for a company"""
        # Mock data for demonstration
        mock_filings = [
            {
                "form": "10-K",
                "filingDate": "2024-11-01",
                "accessionNumber": "0000320193-24-000123",
                "description": "Annual report"
            },
            {
                "form": "10-Q", 
                "filingDate": "2024-08-05",
                "accessionNumber": "0000320193-24-000089",
                "description": "Quarterly report"
            },
            {
                "form": "8-K",
                "filingDate": "2024-07-15",
                "accessionNumber": "0000320193-24-000067",
                "description": "Current report"
            }
        ]
        
        if form_type and form_type != "All":
            mock_filings = [f for f in mock_filings if f["form"] == form_type]
        
        return mock_filings
    
    async def analyze_filing(self, accession_number: str) -> str:
        """Analyze a specific filing"""
        # Mock analysis for demonstration
        analyses = {
            "0000320193-24-000123": """
## 10-K Annual Report Analysis

**Key Highlights:**
- Total revenue: $383.3 billion (↑ 3% YoY)
- Net income: $97.0 billion
- iPhone revenue: $200.6 billion (52% of total)
- Services revenue: $85.2 billion (↑ 12% YoY)

**Risk Factors:**
- Intense competition in all product categories
- Supply chain dependencies
- Regulatory challenges in multiple jurisdictions

**Outlook:**
- Continued investment in AI and machine learning
- Expansion of services portfolio
- Focus on environmental sustainability
            """,
            "default": """
## Filing Analysis

This filing contains important updates regarding:
- Financial performance metrics
- Strategic initiatives
- Risk factor updates
- Management discussion and analysis

Please refer to the full filing for complete details.
            """
        }
        
        return analyses.get(accession_number, analyses["default"])

# Initialize the client
client = SECEdgarGradioClient()

# Define the Gradio interface functions
async def search_and_display_company(query):
    """Search for a company and display its information"""
    if not query:
        return None, None, None, None, "Please enter a company name or ticker"
    
    result = await client.search_company(query)
    
    if result["status"] == "success":
        data = result["data"]
        return (
            data["cik"],
            data["name"],
            data.get("ticker", query.upper()),
            data["exchange"],
            "✅ Company found successfully"
        )
    else:
        return None, None, None, None, f"❌ {result['message']}"

async def fetch_filings(cik, form_type):
    """Fetch recent filings for a company"""
    if not cik:
        return None, "Please search for a company first"
    
    filings = await client.get_recent_filings(cik, form_type)
    
    if filings:
        # Convert to display format
        display_data = []
        for filing in filings:
            display_data.append([
                filing["form"],
                filing["filingDate"],
                filing["description"],
                filing["accessionNumber"]
            ])
        return display_data, f"✅ Found {len(filings)} filings"
    else:
        return None, "No filings found"

async def analyze_selected_filing(filings_data, selected_row):
    """Analyze a selected filing"""
    if not filings_data or selected_row is None:
        return "Please select a filing to analyze"
    
    # Get the accession number from the selected row
    accession_number = filings_data[selected_row][3]
    
    analysis = await client.analyze_filing(accession_number)
    return analysis

# Create the Gradio interface
with gr.Blocks(title="SEC EDGAR Explorer", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        # 📊 SEC EDGAR Explorer
        
        Search and analyze SEC filings using this interactive interface.
        This demo uses the SEC EDGAR Agent Kit to access filing data.
        """
    )
    
    with gr.Tab("🔍 Company Search"):
        with gr.Row():
            search_input = gr.Textbox(
                label="Company Name or Ticker",
                placeholder="e.g., Apple, AAPL, Microsoft",
                scale=3
            )
            search_btn = gr.Button("Search", variant="primary", scale=1)
        
        with gr.Row():
            cik_output = gr.Textbox(label="CIK", interactive=False)
            name_output = gr.Textbox(label="Company Name", interactive=False)
            ticker_output = gr.Textbox(label="Ticker", interactive=False)
            exchange_output = gr.Textbox(label="Exchange", interactive=False)
        
        status_output = gr.Textbox(label="Status", interactive=False)
        
        # Store CIK for use in other tabs
        cik_state = gr.State()
        
        async def search_wrapper(query):
            cik, name, ticker, exchange, status = await search_and_display_company(query)
            return cik, name, ticker, exchange, status, cik
        
        search_btn.click(
            fn=search_wrapper,
            inputs=[search_input],
            outputs=[cik_output, name_output, ticker_output, exchange_output, status_output, cik_state]
        )
        
        search_input.submit(
            fn=search_wrapper,
            inputs=[search_input],
            outputs=[cik_output, name_output, ticker_output, exchange_output, status_output, cik_state]
        )
    
    with gr.Tab("📄 Recent Filings"):
        gr.Markdown("### Browse Recent SEC Filings")
        
        with gr.Row():
            form_type_dropdown = gr.Dropdown(
                choices=["All", "10-K", "10-Q", "8-K", "DEF 14A", "S-1"],
                value="All",
                label="Form Type",
                scale=1
            )
            fetch_btn = gr.Button("Get Filings", variant="primary", scale=1)
        
        filings_table = gr.Dataframe(
            headers=["Form", "Filing Date", "Description", "Accession Number"],
            label="Recent Filings",
            interactive=False,
            wrap=True
        )
        
        filings_status = gr.Textbox(label="Status", interactive=False)
        
        fetch_btn.click(
            fn=fetch_filings,
            inputs=[cik_state, form_type_dropdown],
            outputs=[filings_table, filings_status]
        )
    
    with gr.Tab("📈 Filing Analysis"):
        gr.Markdown("### Analyze SEC Filings")
        
        gr.Markdown("Select a filing from the Recent Filings tab, then click Analyze")
        
        with gr.Row():
            selected_row = gr.Number(label="Selected Row Index", value=0, precision=0)
            analyze_btn = gr.Button("Analyze Filing", variant="primary")
        
        analysis_output = gr.Markdown(label="Filing Analysis")
        
        analyze_btn.click(
            fn=analyze_selected_filing,
            inputs=[filings_table, selected_row],
            outputs=[analysis_output]
        )
    
    with gr.Tab("ℹ️ About"):
        gr.Markdown(
            """
            ## About SEC EDGAR Explorer
            
            This application demonstrates the capabilities of the **SEC EDGAR Agent Kit**, 
            a multi-framework toolkit for accessing and analyzing SEC filing data.
            
            ### Features
            - 🔍 **Company Search**: Look up companies by name or ticker symbol
            - 📄 **Filing Browser**: Browse recent SEC filings with filtering
            - 📈 **Filing Analysis**: AI-powered analysis of filing content
            - 📊 **Data Export**: Download filing data for further analysis
            
            ### Supported Filings
            - **10-K**: Annual reports
            - **10-Q**: Quarterly reports  
            - **8-K**: Current reports (material events)
            - **DEF 14A**: Proxy statements
            - **S-1**: Registration statements
            
            ### Data Source
            Data is sourced from the SEC EDGAR database through the MCP 
            (Model Context Protocol) server.
            
            ### Links
            - [SEC EDGAR Agent Kit](https://github.com/stefanoamorelli/sec-edgar-agentkit)
            - [SEC EDGAR MCP Server](https://github.com/stefanoamorelli/sec-edgar-mcp)
            - [Official SEC EDGAR](https://www.sec.gov/edgar)
            
            ---
            
            **Disclaimer**: This is a demonstration interface. For production use, 
            ensure compliance with SEC data usage policies and rate limits.
            """
        )

# Add example queries
with demo:
    gr.Examples(
        examples=[
            ["Apple"],
            ["MSFT"],
            ["Tesla"],
            ["GOOGL"],
            ["Amazon"]
        ],
        inputs=search_input,
        label="Example Companies"
    )

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False  # Set to True for public sharing
    )