FROM python:3.11-slim

# System deps for bcrypt etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Install Python deps first (better layer caching)
COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /code/requirements.txt

# Copy app
COPY . /code

ENV PORT=8001
EXPOSE 8001

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]
