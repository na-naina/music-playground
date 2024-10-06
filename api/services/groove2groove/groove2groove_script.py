#----------------------------------------------
# TODO: 
# CHECK SO THAT THE MODEL PRODUCES A COHERENT RESULT
# 
#---------------------------------------------

from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import os
import subprocess

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

app.config['MIDI_INPUT_FOLDER'] = '/app/midi_inputs'
app.config['MIDI_OUTPUT_FOLDER'] = '/app/midi_outputs'
app.config['LOGDIR'] = '/app/groove2groove/experiments/v01_drums'  # Directory containing model.yaml

@app.route('/transfer-style', methods=['POST'])
def transfer_style():
    if 'content_midi' not in request.files or 'style_midi' not in request.files:
        return jsonify(message="No MIDI file part"), 400

    content_file = request.files['content_midi']
    style_file = request.files['style_midi']

    if content_file.filename == '' or style_file.filename == '':
        return jsonify(message="No selected file"), 400

    content_filename = secure_filename(content_file.filename)
    style_filename = secure_filename(style_file.filename)
    content_path = os.path.join(app.config['MIDI_INPUT_FOLDER'], content_filename)
    style_path = os.path.join(app.config['MIDI_INPUT_FOLDER'], style_filename)
    output_filename = f"output_{content_filename}"
    output_path = os.path.join(app.config['MIDI_OUTPUT_FOLDER'], output_filename)

    print(f"Content path: {content_path}")
    print(f"Style path: {style_path}")
    content_file.save(content_path)
    style_file.save(style_path)

    # Run the Groove2Groove style transfer using the CLI tool
    command = [
        'python', '-m', 'groove2groove.models.roll2seq_style_transfer',
        '--logdir', app.config['LOGDIR'],
        'run-midi',
        '--sample', '--softmax-temperature', '0.6',
        content_path, style_path, output_path
    ]

    # Run the style transfer process
    command = [
        'python3.6',
        '-m',
        'groove2groove.models.roll2seq_style_transfer',
        '--logdir',
        app.config['LOGDIR'],
        'run-midi',
        '--sample',
        '--softmax-temperature',
        '0.6',
        content_path,
        style_path,
        output_path
    ]
    process = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if process.returncode == 0:
        return jsonify({'output_path': output_path}), 200
    else:
        error_message = process.stderr.decode('utf-8')  # Decode bytes to string
        return jsonify({'error_message': error_message}), 500

@app.route('/midi/<filename>', methods=['GET'])
def get_midi_file(filename):
    filename = secure_filename(filename)  # Ensure the filename is secure
    output_file_path = os.path.join(app.config['MIDI_OUTPUT_FOLDER'], filename)
    if not os.path.exists(output_file_path):
        return jsonify(message="MIDI file not found."), 404
    return send_from_directory(app.config['MIDI_OUTPUT_FOLDER'], filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
