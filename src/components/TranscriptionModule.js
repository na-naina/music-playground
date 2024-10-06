import React, { useState, useEffect, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';
import { useNavigate } from 'react-router-dom';

const TranscriptionModule = () => {
    const { fileURL } = useContext(FileContext);
    const { setMidiPath } = useContext(FileContext);
    const [midiUrl, setMidiUrl] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { resetAllModules } = useContext(FileContext);
    const { resetSignal } = useContext(FileContext);

    useEffect(() => {
        // Reset internal state when the reset signal changes
        setMidiUrl('');
        setError('');
    }, [resetSignal]);

    const handleUploadToMidiPage = () => {
        resetAllModules()
        setMidiPath(midiUrl);
        navigate('/midi');
      };

    const handleTranscribe = async () => {
        if (!fileURL) return;
        setIsLoading(true);

        try {
            const responseBlob = await fetch(fileURL);
            const blob = await responseBlob.blob();
            const file = new File([blob], "transcriptionFile.mp3", { type: blob.type });

            const formData = new FormData();
            formData.append('audioFile', file);

            const response = await fetch('http://localhost:5000/omnizart/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.midi_path) {
                setMidiUrl(`http://localhost:5000/omnizart/midi/${data.midi_path.split('/').pop()}`);
            }
        } catch (err) {
            console.error('Error during transcription:', err);
            setError('Failed to transcribe audio. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!midiUrl && (
                <button onClick={handleTranscribe} disabled={isLoading}>
                    {isLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Transcribing <span className="loading-spinner"></span></span> : 'Transcribe to MIDI'}
                </button>
            )}
            {midiUrl && (
                <>
                    <a className="download-link" href={midiUrl} download>
                        <i className="material-icons">cloud_download</i> Download MIDI
                    </a>
                    <button className="upload-icon-btn" onClick={handleUploadToMidiPage}>
                        <i className="material-icons">cloud_upload</i> Upload & Go to MIDI Page
                    </button>
                </>
            )}
            {error && <p className="error">{error}</p>}

        </div>
    );
};

export default TranscriptionModule;
