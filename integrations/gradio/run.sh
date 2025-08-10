#!/bin/bash
# Run the Gradio SEC EDGAR interface

echo "Starting SEC EDGAR Gradio Interface..."
echo "Installing dependencies..."
pip install -r requirements.txt --user --quiet

echo "Launching Gradio app on http://localhost:7860"
python app.py