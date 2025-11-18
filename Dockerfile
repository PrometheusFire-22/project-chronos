# ==============================================================================
# Project Chronos: Development Container
# ==============================================================================
# Base: Microsoft Dev Container Python 3.11 on Debian 12 (Bookworm)
# Purpose: Provides a complete development environment with all necessary tools
# ==============================================================================

FROM mcr.microsoft.com/devcontainers/python:3.11-bookworm

LABEL maintainer="Project Chronos"
LABEL description="Development environment with PostgreSQL 16 client and geospatial tools"

# Set environment variables for Python
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# Switch to root for system package installation
USER root

# ==============================================================================
# System Dependencies
# ==============================================================================

RUN apt-get update && \
    # Add PostgreSQL repository for version 16
    apt-get install -y --no-install-recommends \
        lsb-release curl gnupg ca-certificates && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | \
        gpg --dearmor -o /usr/share/keyrings/postgres-archive-keyring.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/postgres-archive-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > \
        /etc/apt/sources.list.d/pgdg.list && \
    # Update and install all dependencies
    apt-get update && \
    apt-get install -y --no-install-recommends \
        # Core utilities
        bat build-essential cron dnsutils fzf git htop iputils-ping jq \
        less lsof nano net-tools procps ripgrep sudo tree unzip vim wget zsh \
        # Database and geospatial tools
        postgresql-client-16 postgis gdal-bin \
        # Development tools
        default-jre graphviz \
        # Build dependencies for Python packages
        libpq-dev && \
    # Clean up to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ==============================================================================
# User Configuration
# ==============================================================================

# The devcontainer base image already creates 'vscode' user
# Just ensure they have sudo access
RUN usermod -aG sudo vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/vscode

# ==============================================================================
# Python Environment
# ==============================================================================

# Switch to vscode user for Python setup
USER vscode

# Set working directory
WORKDIR /workspace

# Add user Python bin to PATH
ENV PATH="/home/vscode/.local/bin:${PATH}"

# ==============================================================================
# Container Startup
# ==============================================================================

# Keep container running for VS Code to attach
CMD ["sleep", "infinity"]

# ==============================================================================
# Labels for Docker metadata
# ==============================================================================

LABEL version="2.0"
LABEL description.python="3.11"
LABEL description.os="Debian 12 (Bookworm)"
LABEL description.postgresql="16"
