from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from omnizart.music.app import MusicTranscription

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

app.config['UPLOAD_FOLDER'] = '/app/uploads'
app.config['MIDI_OUTPUT_FOLDER'] = '/app/midi_outputs'
app.config['MIDI_TRANSCRIPTION_MODEL_PATH'] = 'PianoV2'

@app.route('/transcribe', methods=['POST'])
def transcribe_audio_to_midi():
    if 'audioFile' not in request.files:
        return jsonify(message="No audio file provided."), 400
    
    audio_file = request.files['audioFile']
    if audio_file.filename == '':
        return jsonify(message="No file selected for uploading."), 400
    
    audio_filename = secure_filename(audio_file.filename)
    audio_path = os.path.join(app.config['UPLOAD_FOLDER'], audio_filename)
    audio_file.save(audio_path)

    output_filename = f"{os.path.splitext(audio_filename)[0]}.mid"
    output_path = os.path.join(app.config['MIDI_OUTPUT_FOLDER'], output_filename)

    try:
        music_transcription = MusicTranscription()
        music_transcription.transcribe(audio_path, model_path=app.config['MIDI_TRANSCRIPTION_MODEL_PATH'], output=output_path)
    except Exception as e:
        os.remove(audio_path)  # Clean up uploaded file
        return jsonify(message="Error during transcription: " + str(e)), 500

    os.remove(audio_path)  # Clean up uploaded file
    # Log the saved filename
    print(f"Transcribed audio file to MIDI: {output_path}")
    return jsonify(message="MIDI transcription successful", midi_path=output_path)

@app.route('/midi/<filename>', methods=['GET'])
def get_midi_file(filename):
    secure_name = secure_filename(filename)  # Rename the variable to avoid shadowing
    midi_path = os.path.join(app.config['MIDI_OUTPUT_FOLDER'], secure_name)
    if not os.path.exists(midi_path):
        return jsonify(message="MIDI file not found."), 404
    
    return send_from_directory(app.config['MIDI_OUTPUT_FOLDER'], secure_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
