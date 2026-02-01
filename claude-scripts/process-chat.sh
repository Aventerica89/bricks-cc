#!/bin/bash

# Claude Code CLI Chat Processing Script
# This script processes chat messages using Claude Code CLI

set -e

# Read input from stdin
input=$(cat)

# Check if claude command is available
if ! command -v claude &> /dev/null; then
    echo '{"response": "Claude CLI is not installed or not in PATH.", "error": true}'
    exit 1
fi

# Optional: Log the input for debugging (disable in production)
if [ "${DEBUG_CLAUDE:-false}" = "true" ]; then
    echo "[DEBUG] Input received: ${#input} characters" >&2
fi

# Process with Claude Code CLI
# The exact command may vary based on your Claude CLI setup
response=$(echo "$input" | claude --output-format json 2>&1) || {
    echo '{"response": "Failed to process with Claude CLI.", "error": true}'
    exit 1
}

# Output the response
echo "$response"
