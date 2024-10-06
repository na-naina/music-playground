import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

function RecordAudio({ onRecordingComplete }) {
    const waveformRef = useRef(null);
    const [wavesurfer, setWavesurfer] = useState(null);

    useEffect(() => {
        const ws = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'red',
            progressColor: 'darkred',
            plugins: [
                RecordPlugin.create({
                    maxLength: 120,
                    audioType: 'audio/wav'
                })
            ]
        });

        ws.on('finishRecord', function(blob, duration) {
            console.log(blob, duration);
            onRecordingComplete(blob);
        });

        setWavesurfer(ws);

        return () => ws.destroy();
    }, [onRecordingComplete]);

    const startRecording = () => {
        wavesurfer.record.start();
    };

    const stopRecording = () => {
        wavesurfer.record.stop();
    };

    return (
        <div>
            <div ref={waveformRef}></div>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
        </div>
    );
}

export default RecordAudio;
