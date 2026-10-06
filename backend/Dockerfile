FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render/Railway default or override via $PORT)
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn with dynamic PORT support
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
