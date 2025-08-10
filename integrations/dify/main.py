"""
SEC EDGAR Dify Plugin
Main entry point for the Dify plugin that interfaces with SEC EDGAR MCP server
"""

import json
import asyncio
from typing import Dict, Any, Optional
from dify_plugin import ToolProvider

class SECEdgarToolProvider(ToolProvider):
    """
    Provider for SEC EDGAR tools in Dify
    """
    
    def __init__(self):
        super().__init__()
        self.mcp_client = None
        
    def _validate_credentials(self, credentials: Dict[str, Any]) -> None:
        """Validate the provided credentials"""
        if not credentials.get("mcp_server_url"):
            credentials["mcp_server_url"] = "sec-edgar-mcp"
    
    async def _init_mcp_client(self, credentials: Dict[str, Any]):
        """Initialize MCP client connection"""
        if not self.mcp_client:
            # Import and initialize MCP client
            # This would connect to the sec-edgar-mcp server
            from mcp import Client
            self.mcp_client = Client()
            await self.mcp_client.connect(credentials.get("mcp_server_url"))
    
    async def lookup_cik(self, query: str) -> Dict[str, Any]:
        """Look up company CIK by name or ticker"""
        await self._init_mcp_client(self.credentials)
        
        result = await self.mcp_client.call_tool("lookup_cik", {
            "query": query
        })
        
        return {
            "cik": result.get("cik"),
            "name": result.get("name"),
            "ticker": result.get("ticker"),
            "exchange": result.get("exchange")
        }
    
    async def get_recent_filings(
        self, 
        cik: str,
        form_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """Get recent SEC filings for a company"""
        await self._init_mcp_client(self.credentials)
        
        params = {
            "cik": cik,
            "limit": limit
        }
        
        if form_type:
            params["form_type"] = form_type
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
            
        result = await self.mcp_client.call_tool("search_filings", params)
        
        return {
            "filings": result.get("filings", []),
            "count": len(result.get("filings", []))
        }
    
    async def analyze_financials(
        self,
        cik: str,
        form_type: str,
        year: Optional[int] = None,
        quarter: Optional[int] = None
    ) -> Dict[str, Any]:
        """Analyze financial statements from filings"""
        await self._init_mcp_client(self.credentials)
        
        params = {
            "cik": cik,
            "form_type": form_type
        }
        
        if year:
            params["year"] = year
        if quarter and form_type == "10-Q":
            params["quarter"] = quarter
            
        result = await self.mcp_client.call_tool("get_financial_statements", params)
        
        return {
            "financials": result.get("data"),
            "period": result.get("period"),
            "form": result.get("form")
        }
    
    async def analyze_insider_trading(
        self,
        cik: str,
        insider_cik: Optional[str] = None,
        form_type: Optional[str] = None,
        transaction_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze insider trading transactions"""
        await self._init_mcp_client(self.credentials)
        
        params = {
            "cik": cik
        }
        
        if insider_cik:
            params["insider_cik"] = insider_cik
        if form_type:
            params["form_type"] = form_type
        if transaction_type:
            params["transaction_type"] = transaction_type
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
            
        result = await self.mcp_client.call_tool("analyze_insider_trading", params)
        
        return {
            "transactions": result.get("transactions", []),
            "summary": result.get("summary", {}),
            "count": len(result.get("transactions", []))
        }

# Export the provider
provider = SECEdgarToolProvider()