import React, { useState, useEffect, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';

const VoiceConversionModule = () => {
    const { fileURL, setFileURL } = useContext(FileContext);
    const { resetAllModules } = useContext(FileContext);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [error, setError] = useState('');
    const [convertedAudioUrl, setConvertedAudioUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetSignal } = useContext(FileContext);

    useEffect(() => {
        // Reset internal state when the reset signal changes
        setConvertedAudioUrl('');
        setError('');
    }, [resetSignal]);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch('http://localhost:5000/rvc/models');
                const data = await response.json();
                setModels(data.models);
            } catch (error) {
                console.error('Failed to fetch voice conversion models:', error);
                setError('Failed to fetch models. Please check if the server is running.');
            }
        };
        fetchModels();
    }, []);

    const handleVoiceConversion = async () => {
        setIsLoading(true);
        try {
            const responseBlob = await fetch(fileURL);
            const blob = await responseBlob.blob();
            const file = new File([blob], "conversionFile.mp3", { type: blob.type });

            const formData = new FormData();
            formData.append('song_file', file);
            formData.append('model_dir_name', selectedModel);

            const response = await fetch('http://localhost:5000/rvc/convert-voice', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to convert voice.');
            }

            const audioFileName = `conversionFile_${selectedModel}.mp3`;
            const audioPath = `http://localhost:5000/rvc/audio/${audioFileName}`;
            setConvertedAudioUrl(audioPath);
        } catch (err) {
            console.error('Error during voice conversion:', err);
            setError('Failed to convert voice. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadIntoWaveform = () => {
        // Assuming `setFileURL` is available from context to update the main waveform
        resetAllModules();
        if (convertedAudioUrl) {
          setFileURL(convertedAudioUrl);
        }
      };
      

    return (
        <div>
            <select onChange={(e) => setSelectedModel(e.target.value)} value={selectedModel}>
                {models.map(model => (
                    <option key={model} value={model}>{model}</option>
                ))}
            </select>
            <button onClick={handleVoiceConversion} disabled={isLoading}>
                {isLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Converting<span className="loading-spinner"></span></span> : 'Convert voice'}
            </button>
            {error && <p className="error">{error}</p>}
            {convertedAudioUrl && (
                <audio src={convertedAudioUrl} controls autoPlay>
                    Your browser does not support the audio element.
                </audio>
            )}
            {convertedAudioUrl && (<button onClick={handleLoadIntoWaveform}>Load in Waveform</button>)}

        </div>
    );
};

export default VoiceConversionModule;
