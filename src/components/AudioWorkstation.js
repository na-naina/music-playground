import React, { useContext } from 'react';
import { FileContext } from '../contexts/fileContext';
import AudioWaveform from './AudioWaveform';
import AudioUploader from './AudioUploader';
import TranscriptionModule from './TranscriptionModule';
import VoiceConversionModule from './VoiceConversionModule';
import LyricsModule from './LyricsModule';
import SeparationModule from './SeparationModule';

const AudioWorkstation = () => {
    const { fileURL, resetVersion } = useContext(FileContext);

    return (
        <div className='audio-workstation'>
            <AudioUploader />
            {fileURL && (
                <>
                    <AudioWaveform />
                    <div className="module-container">
                        <div className="module-box" key={resetVersion}>
                            <TranscriptionModule />
                        </div>
                        <div className="module-box" key={resetVersion}>
                            <VoiceConversionModule />
                        </div>
                        <div className="module-box" key={resetVersion}>
                            <LyricsModule />
                        </div>
                    </div>
                    <div className="separation-module-box" key={resetVersion}>
                        <SeparationModule />
                    </div>
                </>
            )}
        </div>
    );
};

export default AudioWorkstation;
