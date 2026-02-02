FROM python:3.11-slim

# Install system dependencies for Docling/OCR (e.g. libGL for opencv-python if needed, tesseract if using that backend)
# Docling often requires minimal system libs, but we add common ones for safety.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Poetry
RUN pip install poetry

# Pre-install CPU version of torch to avoid massive CUDA dependency downloads (1GB+)
# and network timeouts during poetry install. Docling will use this.
RUN pip install torch --index-url https://download.pytorch.org/whl/cpu

# Copy dependency definition
COPY pyproject.toml /app/

# Install dependencies (no dev deps, no interaction)
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

# Copy application code
COPY . /app

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
