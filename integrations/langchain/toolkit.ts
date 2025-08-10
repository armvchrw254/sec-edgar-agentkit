import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createClient } from 'sec-edgar-toolkit';

export interface Configuration {
  actions?: {
    companies?: {
      lookupCIK?: boolean;
      getInfo?: boolean;
      getFacts?: boolean;
    };
    filings?: {
      search?: boolean;
      getContent?: boolean;
      analyze8K?: boolean;
      extractSection?: boolean;
    };
    financial?: {
      getStatements?: boolean;
      parseXBRL?: boolean;
    };
    insiderTrading?: {
      analyzeTransactions?: boolean;
    };
  };
}

export interface SECEdgarToolkitOptions {
  userAgent: string; // Required by SEC EDGAR API
  configuration?: Configuration;
}

export class SECEdgarAgentToolkit {
  private client: any; // sec-edgar-toolkit client
  private configuration: Configuration;
  private tools: DynamicStructuredTool[] = [];

  constructor(options: SECEdgarToolkitOptions) {
    this.client = createClient({
      userAgent: options.userAgent
    });
    this.configuration = options.configuration || { actions: {} };
    this.initializeTools();
  }

  private initializeTools(): void {
    // Company tools
    if (this.configuration.actions?.companies?.lookupCIK) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_cik_lookup',
        description: 'Look up a company\'s CIK by name or ticker symbol',
        schema: z.object({
          query: z.string().describe('Company name or ticker symbol'),
        }),
        func: async ({ query }: { query: string }) => {
          try {
            const company = await this.client.companies.lookup(query);
            return JSON.stringify({
              cik: company.cik,
              name: company.name,
              ticker: company.ticker,
              exchange: company.exchange
            });
          } catch (error) {
            return `Error looking up company: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.companies?.getInfo) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_company_info',
        description: 'Get detailed company information using CIK',
        schema: z.object({
          cik: z.string().describe('Company CIK (with or without leading zeros)'),
        }),
        func: async ({ cik }: { cik: string }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const info = await company.getInfo();
            return JSON.stringify(info);
          } catch (error) {
            return `Error getting company info: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.companies?.getFacts) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_company_facts',
        description: 'Retrieve XBRL company facts',
        schema: z.object({
          cik: z.string().describe('Company CIK'),
          taxonomy: z.string().optional().describe('Taxonomy filter (e.g., "us-gaap", "dei")'),
          concept: z.string().optional().describe('Specific concept to retrieve'),
        }),
        func: async ({ cik, taxonomy, concept }: { cik: string; taxonomy?: string; concept?: string }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const facts = await company.getFacts();
            
            // Filter by taxonomy and concept if provided
            let filteredFacts = facts;
            if (taxonomy) {
              filteredFacts = facts[taxonomy] || {};
            }
            if (concept && filteredFacts) {
              filteredFacts = filteredFacts[concept] || {};
            }
            
            return JSON.stringify(filteredFacts);
          } catch (error) {
            return `Error getting company facts: ${error.message}`;
          }
        },
      }));
    }

    // Filing tools
    if (this.configuration.actions?.filings?.search) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_filing_search',
        description: 'Search for filings with filters',
        schema: z.object({
          cik: z.string().optional().describe('Company CIK'),
          ticker: z.string().optional().describe('Company ticker symbol'),
          formTypes: z.array(z.string()).optional().describe('Form types (e.g., ["10-K", "10-Q", "8-K"])'),
          startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
          endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
          limit: z.number().optional().default(10).describe('Maximum number of results'),
        }),
        func: async ({ cik, ticker, formTypes, startDate, endDate, limit }) => {
          try {
            let company;
            if (cik) {
              company = await this.client.companies.getByCik(cik);
            } else if (ticker) {
              company = await this.client.companies.lookup(ticker);
            } else {
              return 'Error: Either CIK or ticker must be provided';
            }

            let filingsQuery = company.filings;
            
            if (formTypes && formTypes.length > 0) {
              filingsQuery = filingsQuery.formTypes(formTypes);
            }
            
            if (startDate) {
              filingsQuery = filingsQuery.after(new Date(startDate));
            }
            
            if (endDate) {
              filingsQuery = filingsQuery.before(new Date(endDate));
            }
            
            const filings = await filingsQuery.recent(limit).fetch();
            
            return JSON.stringify(filings.map(f => ({
              formType: f.formType,
              filingDate: f.filingDate,
              accessionNumber: f.accessionNumber,
              url: f.url,
              size: f.size
            })));
          } catch (error) {
            return `Error searching filings: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.filings?.getContent) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_filing_content',
        description: 'Extract filing content',
        schema: z.object({
          accessionNumber: z.string().describe('Filing accession number'),
          cik: z.string().describe('Company CIK'),
          section: z.string().optional().describe('Specific section to extract'),
        }),
        func: async ({ accessionNumber, cik, section }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const filing = await company.filings.getByAccessionNumber(accessionNumber);
            
            if (section) {
              const content = await filing.getSection(section);
              return content;
            } else {
              const fullContent = await filing.getFullText();
              return fullContent;
            }
          } catch (error) {
            return `Error getting filing content: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.filings?.analyze8K) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_analyze_8k',
        description: 'Analyze 8-K reports for key events',
        schema: z.object({
          cik: z.string().describe('Company CIK'),
          limit: z.number().optional().default(5).describe('Number of recent 8-Ks to analyze'),
        }),
        func: async ({ cik, limit }: { cik: string; limit?: number }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const filings = await company.filings
              .formTypes(['8-K'])
              .recent(limit || 5)
              .fetch();
            
            const analyses = await Promise.all(
              filings.map(async (filing) => {
                const items = await filing.extractItems();
                return {
                  filingDate: filing.filingDate,
                  accessionNumber: filing.accessionNumber,
                  items: Object.keys(items).filter(key => items[key]),
                  url: filing.url
                };
              })
            );
            
            return JSON.stringify(analyses);
          } catch (error) {
            return `Error analyzing 8-K reports: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.filings?.extractSection) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_extract_section',
        description: 'Extract specific sections from filings',
        schema: z.object({
          accessionNumber: z.string().describe('Filing accession number'),
          cik: z.string().describe('Company CIK'),
          section: z.string().describe('Section to extract (e.g., "1A", "7", "Risk Factors")'),
        }),
        func: async ({ accessionNumber, cik, section }: { accessionNumber: string; cik: string; section: string }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const filing = await company.filings.getByAccessionNumber(accessionNumber);
            const content = await filing.getItem(section);
            return content || 'Section not found';
          } catch (error) {
            return `Error extracting section: ${error.message}`;
          }
        },
      }));
    }

    // Financial tools
    if (this.configuration.actions?.financial?.getStatements) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_financial_statements',
        description: 'Extract financial statements from filings',
        schema: z.object({
          cik: z.string().describe('Company CIK'),
          formType: z.enum(['10-K', '10-Q']).describe('Form type'),
          fiscalYear: z.number().optional().describe('Fiscal year'),
          fiscalPeriod: z.enum(['FY', 'Q1', 'Q2', 'Q3', 'Q4']).optional().describe('Fiscal period'),
        }),
        func: async ({ cik, formType, fiscalYear, fiscalPeriod }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            let filings = await company.filings
              .formTypes([formType])
              .recent(1)
              .fetch();
            
            if (filings.length === 0) {
              return 'No filings found';
            }
            
            const filing = filings[0];
            const financials = await filing.getFinancialStatements();
            
            return JSON.stringify(financials);
          } catch (error) {
            return `Error getting financial statements: ${error.message}`;
          }
        },
      }));
    }

    if (this.configuration.actions?.financial?.parseXBRL) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_xbrl_parse',
        description: 'Parse XBRL data for precise financial values',
        schema: z.object({
          accessionNumber: z.string().describe('Filing accession number'),
          cik: z.string().describe('Company CIK'),
          concepts: z.array(z.string()).optional().describe('Specific XBRL concepts to extract'),
        }),
        func: async ({ accessionNumber, cik, concepts }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            const filing = await company.filings.getByAccessionNumber(accessionNumber);
            const xbrlData = await filing.getXBRL();
            
            if (concepts && concepts.length > 0) {
              // Filter to requested concepts
              const filteredData = {};
              concepts.forEach(concept => {
                if (xbrlData[concept]) {
                  filteredData[concept] = xbrlData[concept];
                }
              });
              return JSON.stringify(filteredData);
            }
            
            return JSON.stringify(xbrlData);
          } catch (error) {
            return `Error parsing XBRL: ${error.message}`;
          }
        },
      }));
    }

    // Insider trading tools
    if (this.configuration.actions?.insiderTrading?.analyzeTransactions) {
      this.tools.push(new DynamicStructuredTool({
        name: 'sec_edgar_insider_trading',
        description: 'Analyze insider transactions from Forms 3, 4, and 5',
        schema: z.object({
          cik: z.string().describe('Company CIK'),
          startDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
          endDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
          limit: z.number().optional().default(20).describe('Maximum number of transactions'),
        }),
        func: async ({ cik, startDate, endDate, limit }) => {
          try {
            const company = await this.client.companies.getByCik(cik);
            let filingsQuery = company.filings.formTypes(['3', '4', '5']);
            
            if (startDate) {
              filingsQuery = filingsQuery.after(new Date(startDate));
            }
            
            if (endDate) {
              filingsQuery = filingsQuery.before(new Date(endDate));
            }
            
            const filings = await filingsQuery.recent(limit || 20).fetch();
            
            const transactions = await Promise.all(
              filings.map(async (filing) => {
                try {
                  const ownershipData = await filing.getOwnershipData();
                  return {
                    formType: filing.formType,
                    filingDate: filing.filingDate,
                    reportingOwner: ownershipData.reportingOwner,
                    transactions: ownershipData.transactions
                  };
                } catch (e) {
                  return {
                    formType: filing.formType,
                    filingDate: filing.filingDate,
                    error: 'Unable to parse ownership data'
                  };
                }
              })
            );
            
            return JSON.stringify(transactions);
          } catch (error) {
            return `Error analyzing insider trading: ${error.message}`;
          }
        },
      }));
    }
  }

  getTools(): DynamicStructuredTool[] {
    return this.tools;
  }
}