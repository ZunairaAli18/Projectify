FROM python:3.10-slim

WORKDIR /

# Install system-level dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Install Cython via pip (IMPORTANT!)
RUN pip install Cython

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose Flask port
EXPOSE 5000

# Start Flask app (or change to gunicorn if needed)
CMD ["python", "run.py"]
