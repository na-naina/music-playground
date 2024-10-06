from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
from spleeter.separator import Separator


from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

app.config['AUDIO_INPUT_FOLDER'] = '/app/audio_inputs'
app.config['AUDIO_OUTPUT_FOLDER'] = '/app/audio_outputs'

@app.route('/separate', methods=['POST'])
def separate_audio():
    if 'audioFile' not in request.files:
        return jsonify(message="No audio file provided."), 400
    
    audio_file = request.files['audioFile']
    if audio_file.filename == '':
        return jsonify(message="No file selected for uploading."), 400
    
    audio_filename = secure_filename(audio_file.filename)
    audio_path = os.path.join(app.config['AUDIO_INPUT_FOLDER'], audio_filename)
    audio_file.save(audio_path)

    output_path = os.path.join(app.config['AUDIO_OUTPUT_FOLDER'], audio_filename)

    try:
        # Initialize the spleeter with 2 stems model
        separator = Separator('spleeter:2stems')
        separator.separate_to_file(audio_path, app.config['AUDIO_OUTPUT_FOLDER'])
    except Exception as e:
        os.remove(audio_path)  # Clean up uploaded file
        return jsonify(message="Error during audio separation: " + str(e)), 500

    os.remove(audio_path)  # Clean up uploaded file
    return jsonify(message="Audio separation successful", output_path=output_path)

@app.route('/audio_output/<song_name>/<track_type>', methods=['GET'])
def get_audio_track(song_name, track_type):
    # Security check for the inputs
    safe_song_name = secure_filename(song_name)
    safe_track_type = secure_filename(track_type)

    # Building the expected filename based on the track type
    if safe_track_type in ['vocals', 'accompaniment']:
        filename = f"{safe_song_name}/{safe_track_type}.wav"
    else:
        return jsonify(message="Invalid track type specified."), 400

    output_file_path = os.path.join(app.config['AUDIO_OUTPUT_FOLDER'], filename)

    if not os.path.exists(output_file_path):
        return jsonify(message=f"Output file not found at: {output_file_path}"), 404
    
    # Serve the file from the configured output folder
    return send_from_directory(app.config['AUDIO_OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
