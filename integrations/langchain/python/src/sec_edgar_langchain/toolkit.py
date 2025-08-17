"""SEC EDGAR Toolkit for LangChain agents."""

from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import json
import requests
from langchain_core.tools import Tool
from typing import List
from abc import ABC
from pydantic import BaseModel, Field


class SECEdgarConfig(BaseModel):
    """Configuration for SEC EDGAR toolkit."""
    
    user_agent: str = Field(
        ...,
        description="User agent string required by SEC EDGAR (format: AppName/Version (email))"
    )
    rate_limit_delay: float = Field(
        default=0.1,
        description="Delay between API calls in seconds (SEC requires 10 requests/second max)"
    )


class SECEdgarToolkit:
    """Toolkit for accessing SEC EDGAR data in LangChain agents.
    
    This toolkit provides tools for:
    - Looking up company CIK numbers
    - Searching and retrieving SEC filings (10-K, 10-Q, 8-K, etc.)
    - Extracting financial statements
    - Analyzing XBRL data
    - Tracking insider trading
    - Getting company facts and metadata
    """
    
    def __init__(self, config: SECEdgarConfig):
        """Initialize the SEC EDGAR toolkit.
        
        Args:
            config: Configuration object with user_agent and optional rate limiting
        """
        self.config = config
        self.base_url = "https://data.sec.gov"
        self.headers = {
            "User-Agent": config.user_agent,
            "Accept": "application/json"
        }
    
    def get_tools(self) -> List[Tool]:
        """Get all available SEC EDGAR tools.
        
        Returns:
            List of LangChain Tool objects
        """
        return [
            Tool(
                name="sec_edgar_cik_lookup",
                description="Look up a company's CIK (Central Index Key) number by name or ticker symbol. "
                           "Input: company name or ticker. Output: CIK number and company info.",
                func=self._lookup_cik
            ),
            Tool(
                name="sec_edgar_company_info",
                description="Get detailed company information from SEC EDGAR. "
                           "Input: CIK number or ticker. Output: Company details including name, SIC, location, fiscal year end.",
                func=self._get_company_info
            ),
            Tool(
                name="sec_edgar_company_facts",
                description="Get XBRL company facts (financial data points). "
                           "Input: CIK number. Output: All available XBRL facts including revenues, assets, etc.",
                func=self._get_company_facts
            ),
            Tool(
                name="sec_edgar_filing_search",
                description="Search for SEC filings by company and form type. "
                           "Input: JSON with 'cik' and optional 'form_type' (10-K, 10-Q, 8-K, etc.), 'date_from', 'date_to'. "
                           "Output: List of filings with dates and URLs.",
                func=self._search_filings
            ),
            Tool(
                name="sec_edgar_filing_content",
                description="Extract and parse content from a specific SEC filing. "
                           "Input: Filing URL or accession number. Output: Parsed filing content.",
                func=self._get_filing_content
            ),
            Tool(
                name="sec_edgar_financial_statements",
                description="Extract financial statements from 10-K or 10-Q filings. "
                           "Input: JSON with 'cik' and 'period' (e.g., '2023-Q4' or '2023'). "
                           "Output: Income statement, balance sheet, and cash flow data.",
                func=self._get_financial_statements
            ),
            Tool(
                name="sec_edgar_insider_trading",
                description="Get insider trading data (Form 4 filings). "
                           "Input: JSON with 'cik' and optional 'days_back' (default 90). "
                           "Output: Recent insider transactions with amounts and dates.",
                func=self._get_insider_trading
            ),
            Tool(
                name="sec_edgar_8k_events",
                description="Get recent 8-K material events for a company. "
                           "Input: CIK number. Output: List of recent 8-K events with descriptions.",
                func=self._get_8k_events
            ),
            Tool(
                name="sec_edgar_compare_financials",
                description="Compare financial metrics between two companies. "
                           "Input: JSON with 'cik1', 'cik2', and 'metrics' list. "
                           "Output: Side-by-side comparison of requested metrics.",
                func=self._compare_financials
            )
        ]
    
    def _make_request(self, url: str) -> Dict[str, Any]:
        """Make HTTP request to SEC EDGAR API with rate limiting."""
        import time
        time.sleep(self.config.rate_limit_delay)
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def _lookup_cik(self, company: str) -> str:
        """Look up company CIK by name or ticker."""
        # Clean input
        company = company.strip().upper()
        
        # Try ticker lookup first
        url = f"{self.base_url}/submissions/CIK{company.zfill(10)}.json"
        try:
            data = self._make_request(url)
            return f"CIK: {data['cik']}, Name: {data['name']}"
        except:
            pass
        
        # Search by company name
        tickers_url = "https://www.sec.gov/files/company_tickers.json"
        response = requests.get(tickers_url, headers=self.headers)
        tickers = response.json()
        
        for item in tickers.values():
            if company in item.get('ticker', '').upper() or company in item.get('title', '').upper():
                cik = str(item['cik_str']).zfill(10)
                return f"CIK: {cik}, Name: {item['title']}, Ticker: {item.get('ticker', 'N/A')}"
        
        return f"Company '{company}' not found in SEC EDGAR database"
    
    def _get_company_info(self, cik: str) -> str:
        """Get detailed company information."""
        # Extract CIK if full response provided
        if "CIK:" in cik:
            cik = cik.split("CIK:")[1].split(",")[0].strip()
        
        cik = cik.strip().lstrip('0').zfill(10)
        url = f"{self.base_url}/submissions/CIK{cik}.json"
        
        try:
            data = self._make_request(url)
            
            info = {
                "Name": data.get("name"),
                "CIK": data.get("cik"),
                "Ticker": data.get("tickers", ["N/A"])[0] if data.get("tickers") else "N/A",
                "Exchange": data.get("exchanges", ["N/A"])[0] if data.get("exchanges") else "N/A",
                "SIC": f"{data.get('sic')} - {data.get('sicDescription')}",
                "Industry": data.get("category", "N/A"),
                "Fiscal Year End": data.get("fiscalYearEnd", "N/A"),
                "State": data.get("stateOfIncorporation", "N/A"),
                "Phone": data.get("phone", "N/A"),
                "Address": f"{data.get('addresses', {}).get('business', {}).get('street1', '')}, "
                          f"{data.get('addresses', {}).get('business', {}).get('city', '')}, "
                          f"{data.get('addresses', {}).get('business', {}).get('stateOrCountry', '')} "
                          f"{data.get('addresses', {}).get('business', {}).get('zipCode', '')}",
                "Website": data.get("website", "N/A"),
                "Employees": data.get("employeeCount", "N/A"),
                "Description": data.get("description", "N/A")
            }
            
            return json.dumps(info, indent=2)
        except Exception as e:
            return f"Error fetching company info: {str(e)}"
    
    def _get_company_facts(self, cik: str) -> str:
        """Get XBRL company facts."""
        # Extract CIK if needed
        if "CIK:" in cik:
            cik = cik.split("CIK:")[1].split(",")[0].strip()
        
        cik = cik.strip().lstrip('0').zfill(10)
        url = f"{self.base_url}/api/xbrl/companyfacts/CIK{cik}.json"
        
        try:
            data = self._make_request(url)
            facts = data.get("facts", {})
            
            # Extract key financial metrics
            metrics = {}
            
            # US-GAAP facts
            if "us-gaap" in facts:
                gaap = facts["us-gaap"]
                
                # Revenue
                if "Revenues" in gaap:
                    revenues = gaap["Revenues"]["units"]["USD"]
                    latest_revenue = max(revenues, key=lambda x: x["end"])
                    metrics["Latest Revenue"] = {
                        "value": f"${latest_revenue['val']:,.0f}",
                        "period": latest_revenue["end"],
                        "form": latest_revenue["form"]
                    }
                
                # Net Income
                if "NetIncomeLoss" in gaap:
                    net_income = gaap["NetIncomeLoss"]["units"]["USD"]
                    latest_ni = max(net_income, key=lambda x: x["end"])
                    metrics["Latest Net Income"] = {
                        "value": f"${latest_ni['val']:,.0f}",
                        "period": latest_ni["end"],
                        "form": latest_ni["form"]
                    }
                
                # Total Assets
                if "Assets" in gaap:
                    assets = gaap["Assets"]["units"]["USD"]
                    latest_assets = max(assets, key=lambda x: x["end"])
                    metrics["Total Assets"] = {
                        "value": f"${latest_assets['val']:,.0f}",
                        "period": latest_assets["end"],
                        "form": latest_assets["form"]
                    }
                
                # EPS
                if "EarningsPerShareBasic" in gaap:
                    eps = gaap["EarningsPerShareBasic"]["units"]["USD/shares"]
                    latest_eps = max(eps, key=lambda x: x["end"])
                    metrics["EPS (Basic)"] = {
                        "value": f"${latest_eps['val']:.2f}",
                        "period": latest_eps["end"],
                        "form": latest_eps["form"]
                    }
            
            return json.dumps(metrics, indent=2) if metrics else "No financial facts available"
            
        except Exception as e:
            return f"Error fetching company facts: {str(e)}"
    
    def _search_filings(self, params: str) -> str:
        """Search for SEC filings."""
        try:
            # Parse input parameters
            if isinstance(params, str):
                params = json.loads(params) if params.startswith('{') else {"cik": params}
            
            cik = params.get("cik", "").strip()
            if "CIK:" in cik:
                cik = cik.split("CIK:")[1].split(",")[0].strip()
            
            cik = cik.lstrip('0').zfill(10)
            form_type = params.get("form_type", "")
            date_from = params.get("date_from", "")
            date_to = params.get("date_to", "")
            
            url = f"{self.base_url}/submissions/CIK{cik}.json"
            data = self._make_request(url)
            
            recent_filings = data.get("filings", {}).get("recent", {})
            
            results = []
            for i in range(min(len(recent_filings.get("form", [])), 50)):  # Limit to 50 most recent
                form = recent_filings["form"][i]
                
                # Filter by form type if specified
                if form_type and form_type.upper() not in form.upper():
                    continue
                
                filing_date = recent_filings["filingDate"][i]
                
                # Filter by date range if specified
                if date_from and filing_date < date_from:
                    continue
                if date_to and filing_date > date_to:
                    continue
                
                results.append({
                    "form": form,
                    "filing_date": filing_date,
                    "accession": recent_filings["accessionNumber"][i],
                    "primary_document": recent_filings["primaryDocument"][i],
                    "description": recent_filings.get("primaryDocDescription", [""])[i],
                    "url": f"https://www.sec.gov/Archives/edgar/data/{cik}/{recent_filings['accessionNumber'][i].replace('-', '')}/{recent_filings['primaryDocument'][i]}"
                })
            
            if not results:
                return f"No {form_type if form_type else ''} filings found for CIK {cik}"
            
            return json.dumps(results[:20], indent=2)  # Return top 20 results
            
        except Exception as e:
            return f"Error searching filings: {str(e)}"
    
    def _get_filing_content(self, filing_url: str) -> str:
        """Extract content from a specific filing."""
        try:
            # Handle accession number or full URL
            if not filing_url.startswith("http"):
                return "Please provide a full filing URL from sec_edgar_filing_search"
            
            # Get filing content (limited to text extraction for demo)
            response = requests.get(filing_url, headers=self.headers)
            response.raise_for_status()
            
            content = response.text[:5000]  # Limit content for demo
            
            # Basic parsing - remove HTML tags
            import re
            text = re.sub('<[^<]+?>', '', content)
            text = re.sub(r'\s+', ' ', text).strip()
            
            return f"Filing content (first 5000 chars):\n{text[:5000]}"
            
        except Exception as e:
            return f"Error fetching filing content: {str(e)}"
    
    def _get_financial_statements(self, params: str) -> str:
        """Extract financial statements from recent filings."""
        try:
            params = json.loads(params) if isinstance(params, str) and params.startswith('{') else {"cik": params}
            cik = params.get("cik", "").strip()
            period = params.get("period", "latest")
            
            # Get company facts for financial data
            facts_response = self._get_company_facts(cik)
            
            return f"Financial Statements:\n{facts_response}"
            
        except Exception as e:
            return f"Error fetching financial statements: {str(e)}"
    
    def _get_insider_trading(self, params: str) -> str:
        """Get insider trading data from Form 4 filings."""
        try:
            params = json.loads(params) if isinstance(params, str) and params.startswith('{') else {"cik": params}
            cik = params.get("cik", "").strip()
            days_back = params.get("days_back", 90)
            
            # Calculate date range
            date_from = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
            
            # Search for Form 4 filings
            search_params = {
                "cik": cik,
                "form_type": "4",
                "date_from": date_from
            }
            
            filings = self._search_filings(json.dumps(search_params))
            
            if "Error" in filings or "No" in filings:
                return f"No insider trading data found for the last {days_back} days"
            
            filings_data = json.loads(filings)
            
            summary = f"Insider Trading Activity (Last {days_back} days):\n"
            summary += f"Total Form 4 Filings: {len(filings_data)}\n\n"
            
            for filing in filings_data[:10]:  # Show last 10 transactions
                summary += f"Date: {filing['filing_date']}\n"
                summary += f"Form: {filing['form']}\n"
                summary += f"Document: {filing['description']}\n"
                summary += "-" * 40 + "\n"
            
            return summary
            
        except Exception as e:
            return f"Error fetching insider trading data: {str(e)}"
    
    def _get_8k_events(self, cik: str) -> str:
        """Get recent 8-K material events."""
        try:
            # Search for 8-K filings
            search_params = {
                "cik": cik,
                "form_type": "8-K",
                "date_from": (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
            }
            
            filings = self._search_filings(json.dumps(search_params))
            
            if "Error" in filings or "No" in filings:
                return "No recent 8-K events found"
            
            filings_data = json.loads(filings)
            
            events = f"Recent 8-K Material Events:\n"
            events += f"Total 8-K Filings (Last 90 days): {len(filings_data)}\n\n"
            
            for filing in filings_data[:5]:  # Show last 5 events
                events += f"Date: {filing['filing_date']}\n"
                events += f"Description: {filing.get('description', 'N/A')}\n"
                events += f"URL: {filing['url']}\n"
                events += "-" * 40 + "\n"
            
            return events
            
        except Exception as e:
            return f"Error fetching 8-K events: {str(e)}"
    
    def _compare_financials(self, params: str) -> str:
        """Compare financial metrics between two companies."""
        try:
            params = json.loads(params)
            cik1 = params.get("cik1", "").strip()
            cik2 = params.get("cik2", "").strip()
            metrics = params.get("metrics", ["revenue", "net_income", "assets"])
            
            # Get facts for both companies
            facts1 = self._get_company_facts(cik1)
            facts2 = self._get_company_facts(cik2)
            
            comparison = f"Financial Comparison:\n"
            comparison += f"Company 1 (CIK: {cik1}):\n{facts1}\n\n"
            comparison += f"Company 2 (CIK: {cik2}):\n{facts2}\n"
            
            return comparison
            
        except Exception as e:
            return f"Error comparing financials: {str(e)}"