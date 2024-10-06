import React, { useState, useContext, useRef, useEffect } from 'react';
import { FileContext } from '../contexts/fileContext';
import * as mm from '@magenta/music';
import MidiPlayer from '../components/MidiPlayer';
import '../MidiPage.css';

const MidiPage = () => {
    const { setMidiPath, setError, midiPath, error } = useContext(FileContext);
    const [styleMidi, setStyleMidi] = useState(null);
    const [styleMidiURL, setStyleMidiURL] = useState(null);
    const [midiFile, setMidiFile] = useState(null);
    const [resultMidi, setResultMidi] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = async (event, setMidiState, setURLState) => {
        const file = event.target.files[0];
        if (file) {
            setMidiState(file);
            const url = URL.createObjectURL(file)
            setURLState(url);
            console.log(url);
        }
    };

    const handleUploadAndTransfer = async () => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('style_midi', styleMidi);
        formData.append('content_midi', midiFile);

        try {
            const response = await fetch('http://localhost:5000/groove2groove/transfer-style', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to transfer style');
            }

            const data = await response.json();
            const outputFilename = data.output_path.split('/').pop();
            setResultMidi(`http://localhost:5000/groove2groove/midi/${outputFilename}`);
        } catch (error) {
            console.error('Error during style transfer:', error);
            setError('Failed to transfer style. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="module-container">
                <div className="module-box">
                    <header>
                        <h2>MIDI Style Transfer</h2>
                    </header>
                    <div className="file-upload-section">
                        <div className="upload-group">
                            <label>
                                Upload Main MIDI File
                                <input type="file" accept=".mid" onChange={(e) => handleFileChange(e, setMidiFile, setMidiPath)} />
                            </label>
                            {midiPath && <MidiPlayer midiUrl={midiPath} />}
                        </div>
                        <div className="upload-group">
                            <label>
                                Upload Style MIDI File
                                <input type="file" accept=".mid" onChange={(e) => handleFileChange(e, setStyleMidi, setStyleMidiURL)} />
                            </label>
                            {styleMidiURL && <MidiPlayer midiUrl={styleMidiURL} />}
                        </div>
                        <button onClick={handleUploadAndTransfer} disabled={isLoading}>
                            {isLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Processing <span className="loading-spinner"></span></span> : 'Transfer style'}
                        </button>
                    </div>
                    {resultMidi && (
                        <div className="result-section">
                            <a href={resultMidi} className="download-link" download>Download Transformed MIDI</a>
                            <MidiPlayer midiUrl={resultMidi} />
                        </div>
                    )}
                    {/* <input type="file" onChange={(e) => handleFileChange(e, setStyleMidi, setResultMidi)} /> */}
                    {error && <p className="error">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default MidiPage;
