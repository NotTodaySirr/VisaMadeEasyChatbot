FROM python:3.13-slim

WORKDIR /app

# Install system dependencies including CA certificates
RUN apt-get update && apt-get install -y \
    gcc \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install certifi for Python SSL
RUN pip install --no-cache-dir certifi

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Default command
CMD ["python", "main.py"]