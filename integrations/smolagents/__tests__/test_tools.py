"""Tests for SEC EDGAR agentkit smolagents tools."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from sec_edgar_smolagents import (
    CIKLookupTool,
    CompanyInfoTool,
    FilingSearchTool,
    SECEdgarToolkit,
)


class TestCIKLookupTool:
    """Test CIK lookup tool."""
    
    def test_tool_attributes(self):
        """Test tool has correct attributes."""
        tool = CIKLookupTool()
        assert tool.name == "sec_edgar_cik_lookup"
        assert "CIK" in tool.description
        assert "query" in tool.inputs
        assert tool.output_type == "string"
    
    def test_forward_with_mock_client(self):
        """Test forward method with mock MCP client."""
        mock_client = Mock()
        mock_client.call_tool = AsyncMock(return_value={
            "cik": "0000320193",
            "name": "Apple Inc.",
            "ticker": "AAPL"
        })
        
        tool = CIKLookupTool(mcp_client=mock_client)
        result = tool.forward("Apple")
        
        assert "0000320193" in result
        assert "Apple Inc." in result
        assert "AAPL" in result


class TestCompanyInfoTool:
    """Test company info tool."""
    
    def test_tool_attributes(self):
        """Test tool has correct attributes."""
        tool = CompanyInfoTool()
        assert tool.name == "sec_edgar_company_info"
        assert "company" in tool.description.lower()
        assert "cik" in tool.inputs
    
    def test_forward_formats_output(self):
        """Test forward method formats dict output nicely."""
        mock_client = Mock()
        mock_client.call_tool = AsyncMock(return_value={
            "name": "Apple Inc.",
            "sic": "3571",
            "sic_description": "Electronic Computers"
        })
        
        tool = CompanyInfoTool(mcp_client=mock_client)
        result = tool.forward("0000320193")
        
        assert "Name: Apple Inc." in result
        assert "Sic: 3571" in result
        assert "Electronic Computers" in result


class TestFilingSearchTool:
    """Test filing search tool."""
    
    def test_tool_attributes(self):
        """Test tool has correct attributes."""
        tool = FilingSearchTool()
        assert tool.name == "sec_edgar_filing_search"
        assert "search" in tool.description.lower()
        assert "cik" in tool.inputs
        assert "form_type" in tool.inputs
        assert "limit" in tool.inputs
    
    def test_forward_with_results(self):
        """Test forward method with filing results."""
        mock_client = Mock()
        mock_client.call_tool = AsyncMock(return_value=[
            {
                "form": "10-K",
                "filing_date": "2024-11-01",
                "accession_number": "0000320193-24-000081"
            },
            {
                "form": "10-Q",
                "filing_date": "2024-08-01",
                "accession_number": "0000320193-24-000060"
            }
        ])
        
        tool = FilingSearchTool(mcp_client=mock_client)
        result = tool.forward(cik="0000320193", form_type="10-K", limit=5)
        
        assert "10-K filed on 2024-11-01" in result
        assert "10-Q filed on 2024-08-01" in result
    
    def test_forward_no_results(self):
        """Test forward method with no results."""
        mock_client = Mock()
        mock_client.call_tool = AsyncMock(return_value=[])
        
        tool = FilingSearchTool(mcp_client=mock_client)
        result = tool.forward(cik="0000000000")
        
        assert "No filings found" in result


class TestSECEdgarToolkit:
    """Test SEC EDGAR toolkit."""
    
    def test_toolkit_initialization(self):
        """Test toolkit initializes all tools."""
        toolkit = SECEdgarToolkit()
        tools = toolkit.get_tools()
        
        assert len(tools) == 9
        tool_names = [tool.name for tool in tools]
        assert "sec_edgar_cik_lookup" in tool_names
        assert "sec_edgar_company_info" in tool_names
        assert "sec_edgar_filing_search" in tool_names
    
    def test_get_tool_by_name(self):
        """Test getting specific tool by name."""
        toolkit = SECEdgarToolkit()
        
        tool = toolkit.get_tool_by_name("sec_edgar_cik_lookup")
        assert tool is not None
        assert isinstance(tool, CIKLookupTool)
        
        tool = toolkit.get_tool_by_name("nonexistent_tool")
        assert tool is None
    
    def test_shared_mcp_client(self):
        """Test all tools share the same MCP client."""
        mock_client = Mock()
        toolkit = SECEdgarToolkit(mcp_client=mock_client)
        
        tools = toolkit.get_tools()
        for tool in tools:
            assert tool.mcp_client is mock_client


@pytest.mark.asyncio
async def test_mcp_client_lifecycle():
    """Test MCP client start/stop lifecycle."""
    from sec_edgar_smolagents.mcp_client import MCPClient
    
    client = MCPClient()
    
    # Test context manager
    async with client.session() as session_client:
        assert session_client is client
        # In real usage, process would be started
    
    # After context, process should be stopped
    assert client.process is None