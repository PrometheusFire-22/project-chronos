#!/bin/bash

# List of extensions from .devcontainer/devcontainer.json
extensions=(
    "vscode-icons-team.vscode-icons"
    "aaron-bond.better-comments"
    "ms-python.python"
    # "ms-python.vscode-pylance"  # Failed to install
    "ms-python.black-formatter"
    "charliermarsh.ruff"
    "eamodio.gitlens"
    "mhutchie.git-graph"
    "donjayamanne.githistory"
    "mtxr.sqltools"
    "mtxr.sqltools-driver-pg"
    # "cweijan.vscode-postgresql-client2"  # Failed to install
    # "Geographica.vscode-postgis"  # Failed to install
    "ms-toolsai.jupyter"
    # "ms-toolsai.datawrangler"  # Failed to install
    "mechatroner.rainbow-csv"
    "janisdd.vscode-edit-csv"
    "grapecity.gc-excelviewer"
    "tomoki1207.pdf"
    "jebbs.plantuml"
    "bierner.markdown-mermaid"
    # "excalidraw.excalidraw-vscode"  # Failed to install
    "yzhang.markdown-all-in-one"
    "esbenp.prettier-vscode"
    "GitHub.vscode-github-actions"
    "Atlassian.atlascode"
    "GitHub.vscode-pull-request-github"
    # "HubSpot.hubspot-vs-code"  # Failed to install
    # "anthropic.claude-vscode"  # Failed to install
    "amazonwebservices.aws-toolkit-vscode"
    "google.gemini-cli-vscode-ide-companion"
    "ms-python.mypy-type-checker"
    "google.geminicodeassist"
)

# Determine which command to use
if command -v agy &> /dev/null; then
    CMD="agy"
elif command -v code &> /dev/null; then
    CMD="code"
elif command -v code-server &> /dev/null; then
    CMD="code-server"
else
    echo "Error: No VS Code CLI found (checked 'agy', 'code', 'code-server')."
    exit 1
fi

echo "Using CLI command: $CMD"
echo "Installing extensions..."

for ext in "${extensions[@]}"; do
    echo "Installing $ext..."
    "$CMD" --install-extension "$ext" --force
done

echo "All extensions installed!"
