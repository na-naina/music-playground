# About

This project is a web application that combines a React frontend with a Flask backend. It includes various audio processing services such as Groove2Groove, Omnizart, RVC, Spleeter, and Whisper, all of which communicate as separate docker containers.

## Project Structure

The project is organized into two main directories:

- `api/`: Contains the Flask backend code as well as all the relevant services
- `src/`: Contains the React frontend code

### Backend (api/)

- `api.py`: Main Flask application
- `config.py`: Configuration settings
- `forms/`: Form definitions
- `routes/`: API route definitions
- `services/`: Audio processing services
- `templates/`: HTML templates

### Frontend (src/)

- `App.js`: Main React component
- `components/`: React components
- `contexts/`: React context definitions
- `pages/`: React page components
- `utils/`: Utility functions

## Getting Started

1. Clone the repository
2. Set up the backend:
   ```
   cd api
   pip install -r requirements.txt
   ```
3. Set up the frontend:
   ```
   cd ../src
   npm install
   ```
4. Run the development servers:
   - Backend: `flask run`
   - Frontend: `npm start`

## Docker

The project includes Dockerfiles for both the main application and individual services. To build and run the Docker containers, use the provided `compose.yml` file.
