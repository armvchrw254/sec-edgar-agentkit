import gradio as gr
import json
import asyncio
from datetime import datetime
import pandas as pd
import plotly.graph_objects as go
# For demo purposes, using a placeholder Client
# In production, replace with: from sec_edgar_mcp import Client
class Client:
    async def connect(self):
        pass
    
    async def call_tool(self, tool_name, params):
        # Placeholder implementation for testing
        return {"status": "demo", "message": f"Called {tool_name} with {params}"}

class SECEdgarInterface:
    def __init__(self):
        self.client = None
        
    async def connect(self):
        """Connect to SEC EDGAR MCP server"""
        if not self.client:
            self.client = Client()
            await self.client.connect()
    
    async def lookup_company(self, query):
        """Look up company by name or ticker"""
        await self.connect()
        try:
            result = await self.client.call_tool("lookup_cik", {"query": query})
            if result.get("cik"):
                # Get additional company info
                info = await self.client.call_tool("get_company_info", {"cik": result["cik"]})
                return {
                    "status": "success",
                    "cik": result["cik"],
                    "info": info
                }
            return {"status": "error", "message": "Company not found"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def get_recent_filings(self, cik, form_type, limit):
        """Get recent filings for a company"""
        await self.connect()
        try:
            result = await self.client.call_tool("search_filings", {
                "cik": cik,
                "form_type": form_type if form_type != "All" else None,
                "limit": limit
            })
            return {"status": "success", "filings": result}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    async def analyze_financials(self, cik, years):
        """Analyze financial statements"""
        await self.connect()
        try:
            # Get company facts for financial analysis
            facts = await self.client.call_tool("get_company_facts", {
                "cik": cik,
                "taxonomy": "us-gaap"
            })
            
            # Extract key financial metrics
            metrics = self._extract_financial_metrics(facts, years)
            
            return {"status": "success", "metrics": metrics}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def _extract_financial_metrics(self, facts, years):
        """Extract and format financial metrics from company facts"""
        # This is a simplified example - you'd want more sophisticated parsing
        metrics = {
            "revenue": [],
            "net_income": [],
            "assets": [],
            "liabilities": []
        }
        
        # Parse facts data (implementation depends on actual response format)
        # This is a placeholder structure
        return metrics

# Create interface instance
interface = SECEdgarInterface()

# Gradio UI Components
def create_company_lookup_tab():
    with gr.Tab("Company Lookup"):
        gr.Markdown("## Search for Company Information")
        
        with gr.Row():
            query_input = gr.Textbox(
                label="Company Name or Ticker",
                placeholder="e.g., Apple, AAPL, Microsoft"
            )
            search_btn = gr.Button("Search", variant="primary")
        
        with gr.Row():
            cik_output = gr.Textbox(label="CIK", interactive=False)
            name_output = gr.Textbox(label="Company Name", interactive=False)
        
        with gr.Row():
            ticker_output = gr.Textbox(label="Ticker", interactive=False)
            exchange_output = gr.Textbox(label="Exchange", interactive=False)
        
        info_output = gr.JSON(label="Additional Information")
        
        async def search_company(query):
            result = await interface.lookup_company(query)
            if result["status"] == "success":
                info = result["info"]
                return (
                    result["cik"],
                    info.get("name", ""),
                    info.get("ticker", ""),
                    info.get("exchange", ""),
                    info
                )
            else:
                return "", "", "", "", {"error": result["message"]}
        
        search_btn.click(
            fn=search_company,
            inputs=[query_input],
            outputs=[cik_output, name_output, ticker_output, exchange_output, info_output]
        )

def create_filings_tab():
    with gr.Tab("SEC Filings"):
        gr.Markdown("## Browse Recent SEC Filings")
        
        with gr.Row():
            cik_input = gr.Textbox(label="CIK", placeholder="Enter company CIK")
            form_type = gr.Dropdown(
                choices=["All", "10-K", "10-Q", "8-K", "DEF 14A", "S-1"],
                value="All",
                label="Form Type"
            )
            limit = gr.Slider(minimum=1, maximum=50, value=10, step=1, label="Number of Results")
        
        search_btn = gr.Button("Get Filings", variant="primary")
        
        filings_output = gr.Dataframe(
            headers=["Form", "Filing Date", "Description", "Accession Number"],
            label="Recent Filings"
        )
        
        async def get_filings(cik, form_type, limit):
            result = await interface.get_recent_filings(cik, form_type, int(limit))
            if result["status"] == "success":
                # Convert to dataframe format
                filings = result["filings"]
                data = []
                for filing in filings:
                    data.append([
                        filing.get("form", ""),
                        filing.get("filingDate", ""),
                        filing.get("description", ""),
                        filing.get("accessionNumber", "")
                    ])
                return data
            else:
                return []
        
        search_btn.click(
            fn=get_filings,
            inputs=[cik_input, form_type, limit],
            outputs=[filings_output]
        )

def create_financial_analysis_tab():
    with gr.Tab("Financial Analysis"):
        gr.Markdown("## Analyze Company Financials")
        
        with gr.Row():
            cik_input = gr.Textbox(label="CIK", placeholder="Enter company CIK")
            years_input = gr.Slider(minimum=1, maximum=5, value=3, step=1, label="Years to Analyze")
        
        analyze_btn = gr.Button("Analyze", variant="primary")
        
        with gr.Row():
            revenue_plot = gr.Plot(label="Revenue Trend")
            income_plot = gr.Plot(label="Net Income Trend")
        
        metrics_output = gr.JSON(label="Financial Metrics")
        
        async def analyze_company(cik, years):
            result = await interface.analyze_financials(cik, int(years))
            if result["status"] == "success":
                metrics = result["metrics"]
                
                # Create revenue plot
                fig_revenue = go.Figure()
                fig_revenue.add_trace(go.Scatter(
                    x=list(range(years)),
                    y=metrics.get("revenue", []),
                    mode='lines+markers',
                    name='Revenue'
                ))
                fig_revenue.update_layout(title="Revenue Trend", xaxis_title="Year", yaxis_title="Revenue ($)")
                
                # Create income plot
                fig_income = go.Figure()
                fig_income.add_trace(go.Scatter(
                    x=list(range(years)),
                    y=metrics.get("net_income", []),
                    mode='lines+markers',
                    name='Net Income'
                ))
                fig_income.update_layout(title="Net Income Trend", xaxis_title="Year", yaxis_title="Net Income ($)")
                
                return fig_revenue, fig_income, metrics
            else:
                return None, None, {"error": result["message"]}
        
        analyze_btn.click(
            fn=analyze_company,
            inputs=[cik_input, years_input],
            outputs=[revenue_plot, income_plot, metrics_output]
        )

def create_insider_trading_tab():
    with gr.Tab("Insider Trading"):
        gr.Markdown("## Analyze Insider Trading Activity")
        
        with gr.Row():
            cik_input = gr.Textbox(label="CIK", placeholder="Enter company CIK")
            period = gr.Dropdown(
                choices=["1 Month", "3 Months", "6 Months", "1 Year"],
                value="3 Months",
                label="Time Period"
            )
        
        analyze_btn = gr.Button("Analyze Insider Trading", variant="primary")
        
        summary_output = gr.Textbox(label="Trading Summary", lines=5)
        transactions_output = gr.Dataframe(
            headers=["Date", "Insider", "Transaction Type", "Shares", "Price"],
            label="Recent Transactions"
        )

# Create the main Gradio app
def create_app():
    with gr.Blocks(title="SEC EDGAR Data Explorer", theme=gr.themes.Base()) as app:
        gr.Markdown(
            """
            # SEC EDGAR Data Explorer
            
            Access and analyze SEC filing data through an intuitive interface.
            Powered by the SEC EDGAR MCP server.
            """
        )
        
        create_company_lookup_tab()
        create_filings_tab()
        create_financial_analysis_tab()
        create_insider_trading_tab()
        
        gr.Markdown(
            """
            ---
            *Data provided by SEC EDGAR. This tool is for informational purposes only.*
            """
        )
    
    return app

# Launch the app
if __name__ == "__main__":
    app = create_app()
    app.launch(server_name="0.0.0.0", server_port=7860)