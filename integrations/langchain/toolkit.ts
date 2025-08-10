import { Tool } from '@langchain/core/tools';
import { MCPClient } from '../../src/core/mcp-client';
import { Configuration, SECEdgarToolkitOptions } from '../../src/core/types';
import {
  CIKLookupTool,
  CompanyInfoTool,
  CompanyFactsTool,
} from '../../src/tools/company-tools';
import {
  FilingSearchTool,
  FilingContentTool,
  Analyze8KTool,
} from '../../src/tools/filing-tools';
import {
  FinancialStatementsTool,
  XBRLParseTool,
} from '../../src/tools/financial-tools';
import {
  InsiderTradingTool,
} from '../../src/tools/insider-trading-tools';

export class SECEdgarAgentToolkit {
  private mcpClient: MCPClient;
  private configuration: Configuration;
  private tools: Tool[] = [];

  constructor(options: SECEdgarToolkitOptions) {
    this.mcpClient = new MCPClient(options.mcpServerUrl);
    this.configuration = options.configuration || { actions: {} };
    this.initializeTools();
  }

  private initializeTools(): void {
    const { actions } = this.configuration;

    // Company tools
    if (actions.companies !== false) {
      if (actions.companies?.lookupCIK !== false) {
        this.tools.push(new CIKLookupTool(this.mcpClient));
      }
      if (actions.companies?.getInfo !== false) {
        this.tools.push(new CompanyInfoTool(this.mcpClient));
      }
      if (actions.companies?.getFacts !== false) {
        this.tools.push(new CompanyFactsTool(this.mcpClient));
      }
    }

    // Filing tools
    if (actions.filings !== false) {
      if (actions.filings?.search !== false) {
        this.tools.push(new FilingSearchTool(this.mcpClient));
      }
      if (actions.filings?.getContent !== false) {
        this.tools.push(new FilingContentTool(this.mcpClient));
      }
      if (actions.filings?.analyze8K !== false) {
        this.tools.push(new Analyze8KTool(this.mcpClient));
      }
    }

    // Financial tools
    if (actions.financial !== false) {
      if (actions.financial?.getStatements !== false) {
        this.tools.push(new FinancialStatementsTool(this.mcpClient));
      }
      if (actions.financial?.parseXBRL !== false) {
        this.tools.push(new XBRLParseTool(this.mcpClient));
      }
    }

    // Insider trading tools
    if (actions.insiderTrading !== false) {
      if (actions.insiderTrading?.analyzeTransactions !== false) {
        this.tools.push(new InsiderTradingTool(this.mcpClient));
      }
    }
  }

  async connect(): Promise<void> {
    await this.mcpClient.connect();
  }

  async disconnect(): Promise<void> {
    await this.mcpClient.disconnect();
  }

  getTools(): Tool[] {
    return this.tools;
  }

  getTool(name: string): Tool | undefined {
    return this.tools.find(tool => tool.name === name);
  }

  getToolNames(): string[] {
    return this.tools.map(tool => tool.name);
  }
}