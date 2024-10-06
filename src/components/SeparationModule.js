import React, { useState, useEffect, useContext } from 'react';
import { FileContext } from '../contexts/fileContext';

const SeparationModule = () => {
    const { fileURL, setFileURL } = useContext(FileContext);
    const [vocalsPath, setVocalsPath] = useState('');
    const [accompanimentPath, setAccompanimentPath] = useState('');
    const [error, setError] = useState('');
    const { resetAllModules } = useContext(FileContext);
    const { resetSignal } = useContext(FileContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Reset internal state when the reset signal changes
        setVocalsPath('');
        setAccompanimentPath('');
        setError('');
    }, [resetSignal]);

    const handleSeparation = async () => {
        setIsLoading(true);
        try {
            const responseBlob = await fetch(fileURL);
            const blob = await responseBlob.blob();
            const file = new File([blob], "separationFile.mp3", { type: blob.type });

            const formData = new FormData();
            formData.append('audioFile', file);

            const response = await fetch('http://localhost:5000/spleeter/separate', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                const outputBasePath = data.output_path;
                const songName = outputBasePath.split('/').pop();
                fetchTrack(songName, 'vocals');
                fetchTrack(songName, 'accompaniment');
            } else {
                throw new Error(data.message);
            }
            setError('');
        } catch (err) {
            console.error('Error during separation:', err);
            setError('Failed to separate tracks. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };

    const fetchTrack = async (songName, trackType) => {
        try {
            const trackResponse = await fetch(`http://localhost:5000/spleeter/audio_output/separationFile/${trackType}`);
            const trackBlob = await trackResponse.blob();
            const trackUrl = URL.createObjectURL(trackBlob);
            trackType === 'vocals' ? setVocalsPath(trackUrl) : setAccompanimentPath(trackUrl);
        } catch (error) {
            console.error(`Error fetching ${trackType}:`, error);
            setError(`Failed to fetch ${trackType}. Please try again.`);
        }
    };

    const handleLoadVocalsIntoWaveform = () => {
        resetAllModules();
        if (vocalsPath) {
          setFileURL(vocalsPath);
        }
      };
      
      const handleLoadAccompanimentIntoWaveform = () => {
        resetAllModules();
        if (accompanimentPath) {
          setFileURL(accompanimentPath);
        }
      };
            

      return (
        <div>
            {!vocalsPath && (
            <button onClick={handleSeparation} disabled={isLoading}>
                {isLoading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Separating <span className="loading-spinner"></span></span> : 'Separate tracks'}
            </button>
            )}
            
            {vocalsPath && (
                <>
                    <audio src={vocalsPath} controls />
                    <button onClick={handleLoadVocalsIntoWaveform}>Load Vocals in Waveform</button>
                </>
            )}
            {accompanimentPath && (
                <>
                    <audio src={accompanimentPath} controls />
                    <button onClick={handleLoadAccompanimentIntoWaveform}>Load Accompaniment in Waveform</button>
                </>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default SeparationModule;
