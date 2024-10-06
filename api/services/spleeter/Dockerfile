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

# Add the deadsnakes PPA for Python 3.8
RUN add-apt-repository ppa:deadsnakes/ppa

# Install necessary packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    python3.8 \
    python3-pip \
    python3.8-distutils \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Update alternatives to make Python 3.8 the default python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.8 1

# Update pip and install spleeter
RUN python3 -m pip install --upgrade pip
RUN pip install spleeter

RUN pip install Flask==2.0.0
RUN pip install click==7.1.2
RUN pip install Werkzeug==2.2.2
RUN pip install flask-cors

# Copy the Flask script into the Docker container
COPY ./spleeter_script.py /app

# Create directories for audio input and output
RUN mkdir -p /app/audio_inputs /app/audio_outputs

# Expose port 5000 for the Flask app
EXPOSE 5000

# Set the command to run the Flask app
CMD ["python3.8", "spleeter_script.py"]
