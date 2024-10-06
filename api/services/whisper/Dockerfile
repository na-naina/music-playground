# Start from an NVIDIA CUDA image that includes a compatible Ubuntu version
FROM nvidia/cuda:12.0.1-base-ubuntu22.04

# Set non-interactive installation mode
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory in the Docker container
WORKDIR /app

# Install software properties common to manage repositories
# Combine update, install and clean up in a single RUN to reduce image size
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    python3.9 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Update pip and install whisper
RUN python3 -m pip install --upgrade pip
RUN pip install openai-whisper
RUN pip install setuptools-rust

# Ensure that tensorboardX and any additional dependencies are installed
RUN pip install Flask==2.0.0 click==7.1.2 Werkzeug==2.2.2 tensorboardX

RUN pip install flask-cors

# Copy the Flask script into the Docker container
COPY . /app

# Create directories for audio input and output
RUN mkdir -p /app/song_upload

# Expose port 5000 for the Flask app
EXPOSE 5000

# Set the command to run the Flask app
CMD ["python3", "whisper_script.py"]
