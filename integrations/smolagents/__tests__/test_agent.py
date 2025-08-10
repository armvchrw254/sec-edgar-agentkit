"""Tests for SEC EDGAR agentkit agent creation."""

import pytest
from unittest.mock import Mock, patch
from smolagents import Agent, LiteLLMModel
from sec_edgar_smolagents import create_sec_edgar_agent, SECEdgarToolkit


class TestCreateAgent:
    """Test agent creation functions."""
    
    def test_create_agent_default_model(self):
        """Test creating agent with default model."""
        with patch('sec_edgar_smolagents.agent.LiteLLMModel') as mock_model:
            agent = create_sec_edgar_agent()
            mock_model.assert_called_once_with("gpt-4")
    
    def test_create_agent_string_model(self):
        """Test creating agent with string model name."""
        with patch('sec_edgar_smolagents.agent.LiteLLMModel') as mock_model:
            agent = create_sec_edgar_agent("claude-3-opus")
            mock_model.assert_called_once_with("claude-3-opus")
    
    def test_create_agent_with_model_instance(self):
        """Test creating agent with model instance."""
        mock_model = Mock()
        with patch('sec_edgar_smolagents.agent.Agent') as mock_agent_class:
            agent = create_sec_edgar_agent(mock_model)
            
            # Should not create new model
            mock_agent_class.assert_called_once()
            call_args = mock_agent_class.call_args
            assert call_args[1]['model'] is mock_model
    
    def test_create_agent_default_tools(self):
        """Test agent gets all SEC EDGAR tools by default."""
        with patch('sec_edgar_smolagents.agent.Agent') as mock_agent_class:
            agent = create_sec_edgar_agent()
            
            call_args = mock_agent_class.call_args
            tools = call_args[1]['tools']
            assert len(tools) == 9  # All SEC EDGAR tools
    
    def test_create_agent_custom_tools(self):
        """Test creating agent with custom tool list."""
        custom_tools = [Mock(name="tool1"), Mock(name="tool2")]
        
        with patch('sec_edgar_smolagents.agent.Agent') as mock_agent_class:
            agent = create_sec_edgar_agent(tools=custom_tools)
            
            call_args = mock_agent_class.call_args
            tools = call_args[1]['tools']
            assert tools == custom_tools
    
    def test_create_agent_additional_tools(self):
        """Test adding additional tools to SEC EDGAR tools."""
        additional_tool = Mock(name="custom_tool")
        
        with patch('sec_edgar_smolagents.agent.Agent') as mock_agent_class:
            agent = create_sec_edgar_agent(additional_tools=[additional_tool])
            
            call_args = mock_agent_class.call_args
            tools = call_args[1]['tools']
            assert len(tools) == 10  # 9 SEC EDGAR + 1 additional
            assert additional_tool in tools
    
    def test_create_agent_kwargs_passed_through(self):
        """Test additional kwargs are passed to Agent constructor."""
        with patch('sec_edgar_smolagents.agent.Agent') as mock_agent_class:
            agent = create_sec_edgar_agent(
                verbose=True,
                max_steps=10,
                custom_param="value"
            )
            
            call_args = mock_agent_class.call_args
            assert call_args[1]['verbose'] is True
            assert call_args[1]['max_steps'] == 10
            assert call_args[1]['custom_param'] == "value"