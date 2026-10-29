FROM python:3.11-slim

# Install system dependencies required for OpenCV and PaddlePaddle
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifest and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port (Hugging Face Spaces uses 7860, Render uses 10000 or $PORT)
ENV PORT=7860
EXPOSE 7860

CMD ["gunicorn", "-w", "1", "--threads", "4", "-b", "0.0.0.0:7860", "app:app"]

