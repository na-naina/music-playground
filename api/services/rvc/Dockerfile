# Start from an NVIDIA CUDA image that includes a compatible Ubuntu version
FROM nvidia/cuda:12.0.1-cudnn8-runtime-ubuntu22.04

# Set the working directory in the Docker container
WORKDIR /app

# Set non-interactive installation mode
ENV DEBIAN_FRONTEND=noninteractive

# Install software properties common to manage repositories
# Combine update, install and clean up in a single RUN to reduce image size
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Add the deadsnakes PPA for Python 3.9
RUN add-apt-repository ppa:deadsnakes/ppa

# Install Python 3.9 and other necessary system and Python libraries
# Ensure python3.9, python3.9-dev, python3.9-distutils, python3-pip are installed
RUN apt-get update && apt-get install -y \
    python3.9 \
    python3.9-dev \
    python3.9-distutils \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Update alternatives to make Python 3.9 the default python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.9 1

# Install the prerequisites manually since there are some dependencies can't be
# resolved automatically.
RUN python3 -m pip install --upgrade pip
RUN pip install numpy Cython wheel

# Install additional needed dependencies
RUN apt-get update && apt-get install -y \
    git \
    sox \
    ffmpeg \
    libsndfile1-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Clone and set up your AI project
RUN git clone https://github.com/SociallyIneptWeeb/AICoverGen
RUN pip install -r AICoverGen/requirements.txt

# Ensure that tensorboardX and any additional dependencies are installed
RUN pip install Flask==2.0.0 click==7.1.2 Werkzeug==2.2.2 tensorboardX

RUN pip install flask-cors

# Download initial models needed for your application
RUN python3 AICoverGen/src/download_models.py

# Setup RVC models
# RUN git clone https://huggingface.co/dacoolkid44/VTuber-RVC
# RUN mv VTuber-RVC/* AICoverGen/rvc_models/ && rm -r VTuber-RVC

RUN apt-get update && apt-get install -y unzip

COPY . /app

RUN cd /app/models && \
    for zipfile in *.zip; do \
        dirname=$(basename "$zipfile" .zip); \
        unzip "$zipfile" -d "/app/AICoverGen/rvc_models/$dirname"; \
    done

# Make sure output directories are present
RUN mkdir -p /app/song_output

RUN mkdir -p /app/song_upload

# Expose port 5000 for the Flask app
EXPOSE 5000

# Set the command to run the Flask app
CMD ["python3", "rvc_script.py"]
