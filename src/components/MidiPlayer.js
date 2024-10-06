import React, { useRef, useEffect, useState } from 'react';
import * as mm from '@magenta/music';
import '../MidiPlayer.css';

const MidiPlayer = ({ midiUrl }) => {
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const visualizerRef = useRef(null);

    useEffect(() => {
        if (midiUrl) {
            const soundFontPlayer = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
            soundFontPlayer.loadAllSamples().then(() => {
                setPlayer(soundFontPlayer);
            });
            fetchMidi(midiUrl);

            return () => {
                soundFontPlayer.stop();
            };
        }
    }, [midiUrl]);

    const fetchMidi = async (url) => {
        const seq = await mm.urlToNoteSequence(url);
        if (visualizerRef.current) {
            new mm.PianoRollSVGVisualizer(seq, visualizerRef.current, {
                noteRGB: '60, 120, 216',
                activeNoteRGB: '180, 70, 80',
                noteHeight: 6, // Increase note height for better visibility
                pixelsPerTimeStep: 40, // Increase for wider notes
            });
        }
    };

    const togglePlay = async () => {
        if (player) {
            if (isPlaying) {
                player.stop();
                setIsPlaying(false);
            } else {
                const seq = await mm.urlToNoteSequence(midiUrl);
                player.start(seq);
                setIsPlaying(true);
            }
        }
    };

    return (
        <div className="midi-player">
            <div className="visualizer-container">
                <svg ref={visualizerRef} className="visualizer"></svg>
            </div>
            <button onClick={togglePlay}>
                {isPlaying ? 'Pause' : 'Play'}
            </button>
        </div>
    );
};

export default MidiPlayer;
