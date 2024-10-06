from flask import Flask, request, jsonify, send_from_directory
import subprocess
import os
import shutil
import re
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

# Define directories for input and outputs
app.config['MODEL_UPLOAD_FOLDER'] = '/app/AICoverGen/rvc_models'
app.config['SONG_OUTPUT_FOLDER'] = '/app/song_output'
app.config['REPO_OUTPUT_FOLDER'] = '/app/AICoverGen/song_output'
app.config['SONG_UPLOAD_FOLDER'] = '/app/song_upload'

@app.route('/upload-model', methods=['POST'])
def upload_model():
    if 'model' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    file = request.files['model']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and file.filename.endswith('.zip'):
        filename = secure_filename(file.filename)
        model_path = os.path.join(app.config['MODEL_UPLOAD_FOLDER'], filename)
        file.save(model_path)
        shutil.unpack_archive(model_path, os.path.dirname(model_path))
        os.remove(model_path)
        return jsonify({'message': 'Model uploaded and unpacked successfully'}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/models', methods=['GET'])
def get_models():
    models = [f.name for f in os.scandir(app.config['MODEL_UPLOAD_FOLDER']) if f.is_dir()]
    return jsonify({'models': models}), 200

@app.route('/convert-voice', methods=['POST'])
def convert_voice():
    if 'song_file' in request.files:
        data = request.form
        song_file = request.files['song_file']
        song_path = os.path.join(app.config['SONG_UPLOAD_FOLDER'], song_file.filename)
        song_input = song_path
        song_file.save(song_path)
    else:
        data = request.json
        song_input = data.get('song_input')    

    model_dir_name = data.get('model_dir_name')
    pitch_change = data.get('pitch_change', 0)  # default to no change
    keep_files = data.get('keep_files', False)  # default to not keeping intermediate files
    index_rate = data.get('index_rate', 0.5)
    filter_radius = data.get('filter_radius', 3)
    rms_mix_rate = data.get('rms_mix_rate', 0.25)
    pitch_detection_algo = data.get('pitch_detection_algo', 'rmvpe')
    crepe_hop_length = data.get('crepe_hop_length', 128)
    protect = data.get('protect', 0.33)
    main_vocals_volume_change = data.get('main_vocals_volume_change', 0)
    backup_vocals_volume_change = data.get('backup_vocals_volume_change', 0)
    instrumental_volume_change = data.get('instrumental_volume_change', 0)
    pitch_change_all = data.get('pitch_change_all', 0)
    reverb_size = data.get('reverb_size', 0.15)
    reverb_wetness = data.get('reverb_wetness', 0.2)
    reverb_dryness = data.get('reverb_dryness', 0.8)
    reverb_damping = data.get('reverb_damping', 0.7)
    output_format = data.get('output_format', 'mp3')

    # Secure the model directory name to prevent directory traversal
    model_path = os.path.join(app.config['MODEL_UPLOAD_FOLDER'], model_dir_name)

    if not os.path.exists(model_path):
        return jsonify({'error': f'Model directory: "{model_path}" does not exist'}), 404

    command = [
        'python3', 'AICoverGen/src/main.py',
        '-i', song_input,
        '-dir', model_dir_name,
        '-p', str(pitch_change),
        '-ir', str(index_rate),
        '-fr', str(filter_radius),
        '-rms', str(rms_mix_rate),
        '-palgo', pitch_detection_algo,
        '-hop', str(crepe_hop_length),
        '-pro', str(protect),
        '-mv', str(main_vocals_volume_change),
        '-bv', str(backup_vocals_volume_change),
        '-iv', str(instrumental_volume_change),
        '-pall', str(pitch_change_all),
        '-rsize', str(reverb_size),
        '-rwet', str(reverb_wetness),
        '-rdry', str(reverb_dryness),
        '-rdamp', str(reverb_damping),
        '-oformat', output_format
    ]

    if keep_files:
        command.append('-k')

    # Execute the RVC command
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        return jsonify({'error': 'Voice conversion failed', 'details': result.stderr}), 500
    
    # Extract the output directory and filename from stdout
    match = re.search(r'Cover generated at ([^\n]+)', result.stdout)
    if not match:
        return jsonify({'error': 'Failed to locate the output file from conversion process'}), 500

    output_file = match.group(1)
    # Rename and move to primary output folder
    new_file_name = f"{os.path.splitext(os.path.basename(song_input))[0]}_{model_dir_name}.mp3"
    new_file_path = os.path.join(app.config['SONG_OUTPUT_FOLDER'], new_file_name)
    shutil.copy(output_file, new_file_path)

    return jsonify({'message': 'Voice conversion successful', 'details': result.stdout, 'output_file': new_file_name}), 200

@app.route('/audio/<filename>', methods=['GET'])
def get_midi_file(filename):
    output_file_path = os.path.join(app.config['SONG_OUTPUT_FOLDER'], filename)
    if not os.path.exists(output_file_path):
        return jsonify(message=f"Audio file {output_file_path} not found."), 404
    return send_from_directory(app.config['SONG_OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
