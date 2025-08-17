import { AnalysisState, CompanyData, Filing, FinancialMetrics } from './types';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { loadSECEdgarTools } from './toolkit';

// Load tools once at module initialization
let tools: DynamicStructuredTool[] = [];
let toolsLoaded = false;

async function ensureToolsLoaded() {
  if (!toolsLoaded) {
    tools = await loadSECEdgarTools();
    toolsLoaded = true;
  }
}

function getToolByName(name: string) {
  return tools.find(tool => tool.name === name);
}

export async function lookupCompanies(state: AnalysisState): Promise<Partial<AnalysisState>> {
  await ensureToolsLoaded();
  
  const errors: string[] = [];
  const updatedCompanies: CompanyData[] = [...state.companies];
  
  const lookupTool = getToolByName('sec_edgar_cik_lookup');
  if (!lookupTool) {
    return { 
      errors: [...state.errors, 'CIK lookup tool not available'],
      currentStep: 'error'
    };
  }

  for (const company of updatedCompanies) {
    if (!company.cik) {
      try {
        const result = await lookupTool.invoke({ query: company.ticker });
        const data = JSON.parse(result);
        company.cik = data.cik;
        company.name = data.name;
      } catch (error) {
        errors.push(`Failed to lookup ${company.ticker}: ${error}`);
      }
    }
  }

  return {
    companies: updatedCompanies,
    errors: [...state.errors, ...errors],
    currentStep: 'companies_looked_up',
    nextSteps: ['fetch_filings']
  };
}

export async function fetchFilings(state: AnalysisState): Promise<Partial<AnalysisState>> {
  await ensureToolsLoaded();
  
  const filings: Filing[] = [];
  const errors: string[] = [];
  
  const searchTool = getToolByName('sec_edgar_filing_search');
  if (!searchTool) {
    return { 
      errors: [...state.errors, 'Filing search tool not available'],
      currentStep: 'error'
    };
  }

  for (const company of state.companies) {
    if (!company.cik) continue;
    
    try {
      const result = await searchTool.invoke({
        cik: company.cik,
        formType: '10-K',
        count: 3
      });
      
      const data = JSON.parse(result);
      if (data.filings) {
        filings.push(...data.filings.map((f: any) => ({
          ...f,
          company: company.ticker
        })));
      }
    } catch (error) {
      errors.push(`Failed to fetch filings for ${company.ticker}: ${error}`);
    }
  }

  return {
    filings: [...state.filings, ...filings],
    errors: [...state.errors, ...errors],
    currentStep: 'filings_fetched',
    nextSteps: ['extract_financials']
  };
}

export async function extractFinancials(state: AnalysisState): Promise<Partial<AnalysisState>> {
  await ensureToolsLoaded();
  
  const financialData: FinancialMetrics[] = [];
  const errors: string[] = [];
  
  const financialTool = getToolByName('sec_edgar_financial_statements');
  if (!financialTool) {
    return { 
      errors: [...state.errors, 'Financial statements tool not available'],
      currentStep: 'error'
    };
  }

  for (const filing of state.filings) {
    try {
      const result = await financialTool.invoke({
        accessionNumber: filing.accessionNumber
      });
      
      const data = JSON.parse(result);
      if (data.statements) {
        financialData.push({
          company: filing.company || '',
          period: filing.reportDate || filing.filingDate,
          metrics: {
            revenue: data.statements.income?.revenue || null,
            net_income: data.statements.income?.netIncome || null,
            gross_margin: data.statements.margins?.grossMargin || null,
            operating_margin: data.statements.margins?.operatingMargin || null,
          }
        });
      }
    } catch (error) {
      errors.push(`Failed to extract financials from ${filing.accessionNumber}: ${error}`);
    }
  }

  return {
    financialData: [...state.financialData, ...financialData],
    errors: [...state.errors, ...errors],
    currentStep: 'financials_extracted',
    nextSteps: ['analyze_trends']
  };
}

export async function analyzeTrends(state: AnalysisState): Promise<Partial<AnalysisState>> {
  const insights: string[] = [];
  const comparisons: Record<string, any> = {};

  for (const company of state.companies) {
    const companyData = state.financialData.filter(d => d.company === company.ticker);
    
    if (companyData.length >= 2) {
      const sorted = companyData.sort((a, b) => 
        new Date(b.period).getTime() - new Date(a.period).getTime()
      );
      
      const latest = sorted[0];
      const previous = sorted[1];
      
      if (latest.metrics.revenue && previous.metrics.revenue) {
        const growth = ((latest.metrics.revenue - previous.metrics.revenue) / previous.metrics.revenue) * 100;
        insights.push(`${company.ticker}: Revenue ${growth > 0 ? 'grew' : 'declined'} by ${Math.abs(growth).toFixed(1)}% YoY`);
        
        comparisons[company.ticker] = {
          revenueGrowth: growth,
          latestRevenue: latest.metrics.revenue,
          previousRevenue: previous.metrics.revenue
        };
      }
    }
  }

  return {
    insights: [...state.insights, ...insights],
    comparisons: { ...state.comparisons, ...comparisons },
    currentStep: 'analysis_complete',
    nextSteps: ['generate_report']
  };
}

export async function generateReport(state: AnalysisState): Promise<Partial<AnalysisState>> {
  const reportLines: string[] = [
    '# SEC EDGAR Analysis Report',
    '',
    '## Companies Analyzed',
    ...state.companies.map(c => `- ${c.name || c.ticker} (${c.ticker})`),
    '',
    '## Key Insights',
    ...state.insights.map(i => `- ${i}`),
    '',
    '## Financial Comparisons',
  ];

  for (const [ticker, data] of Object.entries(state.comparisons)) {
    reportLines.push(`### ${ticker}`);
    if (data.revenueGrowth !== undefined) {
      reportLines.push(`- Revenue Growth: ${data.revenueGrowth.toFixed(1)}%`);
      reportLines.push(`- Latest Revenue: $${(data.latestRevenue / 1e9).toFixed(2)}B`);
    }
  }

  const reportMessage = new AIMessage(reportLines.join('\n'));

  return {
    messages: [...state.messages, reportMessage],
    currentStep: 'report_generated',
    nextSteps: []
  };
}

export async function handle8KEvents(state: AnalysisState): Promise<Partial<AnalysisState>> {
  await ensureToolsLoaded();
  
  const errors: string[] = [];
  const insights: string[] = [];
  
  const analyze8KTool = getToolByName('sec_edgar_analyze_8k');
  if (!analyze8KTool) {
    return { 
      errors: [...state.errors, '8-K analysis tool not available'],
      currentStep: 'error'
    };
  }

  for (const company of state.companies) {
    if (!company.cik) continue;
    
    try {
      const result = await analyze8KTool.invoke({
        cik: company.cik,
        limit: 5
      });
      
      const data = JSON.parse(result);
      if (data.events && data.events.length > 0) {
        insights.push(`${company.ticker} recent events: ${data.events.map((e: any) => e.type).join(', ')}`);
      }
    } catch (error) {
      errors.push(`Failed to analyze 8-K for ${company.ticker}: ${error}`);
    }
  }

  return {
    insights: [...state.insights, ...insights],
    errors: [...state.errors, ...errors],
    currentStep: '8k_analyzed',
    nextSteps: ['generate_report']
  };
}

export async function analyzeInsiderTrading(state: AnalysisState): Promise<Partial<AnalysisState>> {
  await ensureToolsLoaded();
  
  const errors: string[] = [];
  const insights: string[] = [];
  
  const insiderTool = getToolByName('sec_edgar_insider_trading');
  if (!insiderTool) {
    return { 
      errors: [...state.errors, 'Insider trading tool not available'],
      currentStep: 'error'
    };
  }

  for (const company of state.companies) {
    if (!company.cik) continue;
    
    try {
      const result = await insiderTool.invoke({
        cik: company.cik,
        months: 3
      });
      
      const data = JSON.parse(result);
      if (data.summary) {
        const netActivity = data.summary.totalBought - data.summary.totalSold;
        insights.push(
          `${company.ticker} insider activity: ${netActivity > 0 ? 'Net buying' : 'Net selling'} of $${Math.abs(netActivity / 1e6).toFixed(1)}M`
        );
      }
    } catch (error) {
      errors.push(`Failed to analyze insider trading for ${company.ticker}: ${error}`);
    }
  }

  return {
    insights: [...state.insights, ...insights],
    errors: [...state.errors, ...errors],
    currentStep: 'insider_trading_analyzed',
    nextSteps: ['generate_report']
  };
}