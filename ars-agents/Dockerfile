FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt is now in the root of the service directory
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run from the root of ars-agents to keep relative imports working
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
