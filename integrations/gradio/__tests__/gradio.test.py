#!/usr/bin/env python3
"""Test that Gradio app imports correctly"""

def test_gradio_import():
    try:
        # Test that we can import the app module
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
        from app import create_app, SECEdgarInterface
        
        # Test that main components exist
        assert SECEdgarInterface is not None
        assert create_app is not None
        
        # Test that we can create an interface instance
        interface = SECEdgarInterface()
        assert interface is not None
        
        print("✓ Gradio app imports successfully")
        return True
        
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_gradio_import()
    exit(0 if success else 1)