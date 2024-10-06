# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install required Python packages
RUN pip install Flask flask_wtf requests python-dotenv

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run api.py when the container launches
CMD ["flask", "run", "--host=0.0.0.0"]
