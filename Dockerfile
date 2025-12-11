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
    # Install Docker CLI and Docker Compose (static binaries for reliability)
    curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.4.1.tgz -o /tmp/docker.tgz && \
    tar xzvf /tmp/docker.tgz --strip 1 -C /usr/local/bin docker/docker && \
    rm /tmp/docker.tgz && \
    chmod +x /usr/local/bin/docker && \
    # Install Docker Compose plugin
    curl -fsSL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose && \
    mkdir -p /usr/local/lib/docker/cli-plugins && \
    ln -s /usr/local/bin/docker-compose /usr/local/lib/docker/cli-plugins/docker-compose && \
    # Clean up to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# ==============================================================================
# User Configuration

# ==============================================================================

# The devcontainer base image already creates 'vscode' user
# Ensure they have sudo access and docker access
RUN usermod -aG sudo vscode && \
    echo "vscode ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/vscode && \
    # Create docker group with GID 984 to match host docker socket
    groupadd -g 984 dockerhost 2>/dev/null || true && \
    usermod -aG dockerhost vscode

# ==============================================================================
# Python Environment
# ==============================================================================

# Switch to vscode user for Python setup
USER vscode

# Set working directory
WORKDIR /workspace

# Add user Python bin to PATH
ENV PATH="/home/vscode/.local/bin:${PATH}"

# Pre-install common dev dependencies to speed up container startup
# This prevents the 5-10 minute wait during postCreateCommand
COPY --chown=vscode:vscode pyproject.toml ./
RUN pip install --user --upgrade pip setuptools wheel && \
    pip install --user \
        # Testing frameworks
        pytest pytest-cov pytest-mock pytest-asyncio \
        # Code quality tools
        black ruff mypy pre-commit \
        # Type stubs
        types-requests types-python-dateutil types-pytz \
        # Documentation
        sphinx sphinx-rtd-theme \
        # Jupyter & Data Science
        jupyter ipykernel matplotlib seaborn \
    # Clean up pip cache to reduce image size
    && pip cache purge \
    # Remove pyproject.toml as it will be mounted from host
    && rm pyproject.toml

# ==============================================================================
# Node.js Environment (as vscode user)
# ==============================================================================
# This runs as the 'vscode' user, so fnm and node versions are installed for the correct user.
RUN curl -fsSL https://fnm.vercel.app/install | bash && \
    # The fnm install script modifies .bashrc, so we source it to use fnm in the next command.
    # We use bash -i -c to simulate an interactive shell, which properly sources .bashrc
    /bin/bash -i -c "fnm install 20 && npm install -g pnpm@8.15.0"

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
