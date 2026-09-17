FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio and DSP files (libsndfile for soundfile)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ /app/

# Expose target port
ENV PORT=8000
EXPOSE 8000

# Start FastAPI application using uvicorn
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
