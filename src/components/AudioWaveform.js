import React, { useState, useEffect, useContext, useRef } from 'react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.esm.js';
import { FileContext } from '../contexts/fileContext';
import wavesurfer from 'wavesurfer.js';

import bufferToWave from '../utils/bufferToWave';


const AudioWaveform = () => {
    const wavesurferRef = useRef(null);
	const timelineRef = useRef(null);

	const [audioReady, setAudioReady] = useState(false);
    const { fileURL } = useContext(FileContext);
    const [wavesurferObj, setWavesurferObj] = useState(null);
	const [wsRegionsObj, setWsRegionsObj] = useState([]);
	const [wsEnvelopeObj, setWsEnvelopeObj] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [zoom, setZoom] = useState(1);
	const [duration, setDuration] = useState(0); // duration is used to set the default region of selection for trimming the audio

    useEffect(() => {
        if (wavesurferRef.current && !wavesurferObj) {
            const ws = wavesurfer.create({
                container: '#waveform',
				scrollParent: true,
				autoCenter: true,
				cursorColor: '#5a5af1',
				loopSelection: true,
				waveColor: '#211027',
				progressColor: '#5a5af1',
				responsive: true,
                plugins: [
                    TimelinePlugin.create({
                        container: '#wave-timeline',
                    }),
                ]
            });

			const wsRegions = ws.registerPlugin(RegionsPlugin.create());
			
			setWsRegionsObj(wsRegions);
            setWavesurferObj(ws);

            ws.on('ready', () => {
                wsRegions.enableDragSelection({ threshold: 1 });
				setAudioReady(true);
                ws.play();
                setPlaying(true);
            });

            ws.on('finish', () => setPlaying(false));
        }
    }, [wavesurferRef, wavesurferObj]);

	useEffect(() => {
        if (wavesurferObj && fileURL) {
            wavesurferObj.load(fileURL);
        }
    }, [fileURL, wavesurferObj]);

    // Apply zoom only when audio is ready
    useEffect(() => {
        if (audioReady) {
            wavesurferObj.zoom(zoom);
        }
    }, [zoom, audioReady]);

    // Adjust volume
    useEffect(() => {
        if (wavesurferObj) {
            wavesurferObj.setVolume(volume);
        }
    }, [volume, wavesurferObj]);

	useEffect(() => {
		if (wavesurferObj) {
			// once the waveform is ready, play the audio
			wavesurferObj.on('ready', () => {
				wavesurferObj.play();
				wsRegionsObj.enableDragSelection({}); // to select the region to be trimmed
				setDuration(Math.floor(wavesurferObj.getDuration())); // set the duration in local state
			});

			// once audio starts playing, set the state variable to true
			wavesurferObj.on('play', () => {
				setPlaying(true);
			});

			// once audio starts playing, set the state variable to false
			wavesurferObj.on('finish', () => {
				setPlaying(false);
			});

			// if multiple regions are created, then remove all the previous regions so that only 1 is present at any given time
			wavesurferObj.on('region-updated', (region) => {
				const regions = region.wavesurfer.regions.list;
				const keys = Object.keys(regions);
				if (keys.length > 1) {
					regions[keys[0]].remove();
				}
			});
		}
	}, [wavesurferObj]);

	const handlePlayPause = (e) => {
		wavesurferObj.playPause();
		setPlaying(!playing);
	};

	const handleReload = (e) => {
		// stop will return the audio to 0s, then play it again
		wavesurferObj.stop();
		wavesurferObj.play();
		setPlaying(true); // to toggle the play/pause button icon
	};

	const handleVolumeSlider = (e) => {
		setVolume(e.target.value);
	};

	const handleZoomSlider = (e) => {
		setZoom(e.target.value);
	};

	const handleTrim = async (e) => {
		if (wavesurferObj && wsRegionsObj) {
			const regions = wsRegionsObj.getRegions();
			if (regions) {
				const regionKeys = Object.keys(regions);
				if (regionKeys.length > 0) {
					const region = regions[regionKeys[0]];
					if (region) {
						const { start, end } = region;
						const originalBuffer = wavesurferObj.getDecodedData();
						if (originalBuffer) {
							const sampleRate = originalBuffer.sampleRate;
							const numberOfChannels = originalBuffer.numberOfChannels;
							const firstSampleIndex = Math.floor(start * sampleRate);
							const lastSampleIndex = Math.floor(end * sampleRate);
							
							// Using OfflineAudioContext to create the new trimmed buffer
							const offlineContext = new OfflineAudioContext(numberOfChannels, lastSampleIndex - firstSampleIndex, sampleRate);
							const newBufferSource = offlineContext.createBufferSource();
							newBufferSource.buffer = originalBuffer;
	
							// Connect the source to the context's destination
							newBufferSource.connect(offlineContext.destination);
							newBufferSource.start(0, start, end - start);
	
							// Render the audio
							const renderedBuffer = await offlineContext.startRendering();
							const blob = await bufferToWave(renderedBuffer, renderedBuffer.length);
							wavesurferObj.loadBlob(blob);
							wsRegionsObj.clearRegions();
						} else {
							console.error("Decoded audio data is not available.");
						}
					}
				} else {
					console.error("No regions to trim.");
				}
			} else {
				console.error("No region data available.");
			}
		} else {
			console.error("WaveSurfer object or regions object is not initialized.");
		}
	};
	
	return (
		<section className='waveform-container'>
			<div ref={wavesurferRef} id='waveform' />
			<div ref={timelineRef} id='wave-timeline' />
			<div className='all-controls'>
				<div className='left-container'>
					<button
						title='play/pause'
						className='controls'
						onClick={handlePlayPause}>
						{playing ? (
							<i className='material-icons'>pause</i>
						) : (
							<i className='material-icons'>play_arrow</i>
						)}
					</button>
					<button
						title='reload'
						className='controls'
						onClick={handleReload}>
						<i className='material-icons'>replay</i>
					</button>
					<button className='trim' onClick={handleTrim}>
						<i
							style={{
								fontSize: '1.2em',
								color: 'white',
							}}
							className='material-icons'>
							content_cut
						</i>
						Trim
					</button>
				</div>
				<div className='right-container'>
					<div className='volume-slide-container'>
						<i className='material-icons zoom-icon'>
							remove_circle
						</i>
						<input
							type='range'
							min='1'
							max='1000'
							value={zoom}
							onChange={handleZoomSlider}
							className='slider zoom-slider'
						/>
						<i className='material-icons zoom-icon'>add_circle</i>
					</div>
					<div className='volume-slide-container'>
						{volume > 0 ? (
							<i className='material-icons'>volume_up</i>
						) : (
							<i className='material-icons'>volume_off</i>
						)}
						<input
							type='range'
							min='0'
							max='1'
							step='0.05'
							value={volume}
							onChange={handleVolumeSlider}
							className='slider volume-slider'
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AudioWaveform;
