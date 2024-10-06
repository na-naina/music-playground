from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS
import subprocess
import re

app = Flask(__name__)
CORS(app)

# Define directory for song uploads
app.config['SONG_UPLOAD_FOLDER'] = '/app/song_upload'

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Check if the request contains a file
    if 'song_file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    # Get the file from the request
    song_file = request.files['song_file']
    
    # Check if the file exists
    if song_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Check if the file is of a valid type
    if song_file and song_file.filename.endswith(('.mp3', '.wav', '.flac')):
        # Save the file to the upload folder
        filename = secure_filename(song_file.filename)
        song_path = os.path.join(app.config['SONG_UPLOAD_FOLDER'], filename)
        song_file.save(song_path)
        
        # Transcribe speech in the song file using Whisper CLI
        transcription, language = transcribe_audio(song_path)
        
        # Return the transcription and detected language
        return jsonify({'transcription': transcription, 'language': language}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

def transcribe_audio(audio_path):
    # Run the Whisper CLI command
    command = ["whisper", audio_path, "--model", "tiny"]
    result = subprocess.run(command, capture_output=True, text=True)
    
    if result.returncode == 0:
        # Parse the output to extract the detected language
        language_match = re.search(r'Detected language: (\w+)', result.stdout)
        language = language_match.group(1) if language_match else "Unknown"

        # Extract only the transcript lines, maintaining timestamps
        transcription = '\n'.join(line for line in result.stdout.split('\n') if re.match(r'\[\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}\.\d{3}\]', line))

        return transcription, language
    else:
        return "Error in transcription: " + result.stderr, "Unknown"

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
