# Use the TensorFlow 1.12.0 GPU image
FROM tensorflow/tensorflow:1.12.0-gpu-py3

# Set non-interactive installation mode
ENV DEBIAN_FRONTEND=noninteractive

# Set the working directory in the Docker container
WORKDIR /app

# Install software-properties-common to add PPAs
RUN apt-get update && apt-get install -y software-properties-common

# Add the PPA for Python 3.6
RUN add-apt-repository -y ppa:jblgf0/python

# Install necessary packages including Python 3.6 from the deadsnakes PPA
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    git \
    python3.6 \
    python3.6-dev \
    python3-pip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://bootstrap.pypa.io/pip/3.6/get-pip.py | python3.6

# Update pip and install dataclasses using Python 3.6
RUN python3.6 -m pip install --upgrade pip 

# Clone the groove2groove repository
RUN git clone https://github.com/cifkao/groove2groove.git /app/groove2groove

# Install Python package dependencies
RUN pip3.6 install -r /app/groove2groove/requirements.txt

RUN apt-get update && apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Install the Groove2Groove package with GPU support
RUN pip3.6 install '/app/groove2groove/code[gpu]'

# Copy local files to the Docker container
COPY . /app

# Unzip model files into a specific directory
# Run a script to unzip models into the desired directory structure
RUN cd /app/models && \
    for zipfile in *.zip; do \
        dirname=$(basename "$zipfile" .zip); \
        unzip "$zipfile" -d "/app/groove2groove/experiments"; \
    done


RUN pip3.6 install Flask
RUN pip3.6 install flask-cors

RUN mkdir -p /app/midi_inputs /app/midi_outputs

# Expose port 5000 for network access
EXPOSE 5000

# Set the command to run the application, adjust script or module as needed
CMD ["python3.6", "groove2groove_script.py"]
