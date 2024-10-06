import React, { useState, useEffect, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';

const LyricsModule = () => {
    const { fileURL } = useContext(FileContext);
    const [transcription, setTranscription] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetSignal } = useContext(FileContext);

    useEffect(() => {
        // Reset internal state when the reset signal changes
        setTranscription('');
        setError('');
    }, [resetSignal]);

    const handleGetLyrics = async () => {
        setIsLoading(true);
        try {
            const responseBlob = await fetch(fileURL);
            const blob = await responseBlob.blob();
            const file = new File([blob], "lyricsFile.mp3", { type: blob.type });

            const formData = new FormData();
            formData.append('song_file', file);

            const response = await fetch('http://localhost:5000/whisper/transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to transcribe lyrics.');
            }

            setTranscription(data.transcription);
        } catch (err) {
            console.error('Error during lyrics transcription:', err);
            setError('Failed to transcribe lyrics. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatLyrics = (lyrics) => {
        const lines = lyrics.split('\n').filter(line => line.trim() !== '');
        return lines.map((line, index) => {
            const match = line.match(/\[(\d{2}:\d{2}\.\d{3})\s-->\s(\d{2}:\d{2}\.\d{3})\]\s(.+)/);
            if (match) {
                return (
                    <div key={index} className="lyric-line">
                        <span className="timestamp">{match[1]}</span>
                        <span className="lyric-text">{match[3]}</span>
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div>
            {!transcription && (
                <button onClick={handleGetLyrics} disabled={isLoading}>
                {isLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Transcribing <span className="loading-spinner"></span></span> : 'Get lyrics'}
                </button>
            )}  
            {error && <p className="error">{error}</p>}
            {transcription && (
                <div className="lyrics-container">
                    <h3>Lyrics:</h3>
                    <div className="lyrics-box">
                        {formatLyrics(transcription)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LyricsModule;
