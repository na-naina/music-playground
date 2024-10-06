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

# Add the deadsnakes PPA for Python 3.7
RUN add-apt-repository ppa:deadsnakes/ppa

# Install Python 3.7 and other necessary system and Python libraries
# Ensure python3.7, python3.7-dev, python3.7-distutils, python3-pip are installed
RUN apt-get update && apt-get install -y \
    python3.7 \
    python3.7-dev \
    python3.7-distutils \
    python3-pip \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Update alternatives to make Python 3.7 the default python3
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.7 1

# Install the prerequisites manually since there are some dependencies can't be
# resolved automatically.
RUN python3 -m pip install --upgrade pip
RUN pip install numpy Cython wheel

# Additional system packages are required to fully use Omnizart.
# Ensure the installation in one RUN command
RUN apt-get update && apt-get install -y \
    libsndfile1-dev \
    fluidsynth \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Omnizart
RUN pip install omnizart

# Then download the checkpoints
RUN omnizart download-checkpoints

RUN pip install Flask==2.0.0
RUN pip install click==7.1.2
RUN pip install flask-cors

# Copy the Flask script into the Docker container
COPY ./omnizart_script.py /app

RUN mkdir -p /app/uploads /app/midi_outputs

# Expose port 5000 for the Flask app
EXPOSE 5000

# Set the command to run the Flask app
CMD ["python3", "omnizart_script.py"]
