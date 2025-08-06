# AI Moderation Service Dockerfile
FROM python:3.12-slim

# Install system dependencies for PyTorch and compilation
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 aiuser && \
    useradd --uid 1001 --gid aiuser --shell /bin/bash --create-home aiuser

# Set working directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY --chown=aiuser:aiuser requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=aiuser:aiuser . .

# Switch to non-root user
USER aiuser

# Set environment variables
ENV PYTHONPATH=/app
ENV MODEL_CACHE_DIR=/app/models
ENV API_HOST=0.0.0.0
ENV API_PORT=8001
ENV LOG_LEVEL=INFO

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python3 -c "import requests; requests.get('http://localhost:8001/health')" || exit 1

# Start the moderation service
CMD ["python3", "moderation_server.py"]
