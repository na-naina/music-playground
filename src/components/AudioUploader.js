import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileContext } from '../contexts/fileContext';

const AudioUploader = () => {
    const navigate = useNavigate();
    const inputFile = useRef(null);
    const { fileURL, setFileURL } = useContext(FileContext);
    const [file, setFile] = useState(null);
    const { resetAllModules } = useContext(FileContext);
    const { resetSignal } = useContext(FileContext);

    useEffect(() => {
        // Reset internal state when the reset signal changes
    }, [resetSignal]);

    useEffect(() => {
        resetAllModules();
        if (file) {
            setFileURL(file);
        }
    }, [file, setFileURL, navigate]);

    const handleButtonClick = () => {
        inputFile.current.click();
    };

    const handleFileUpload = (e) => {
        setFile(URL.createObjectURL(e.target.files[0]));
    };

    return (
        <div className='upload-audio'>
            <i
                style={{ color: '#5a5af1' }}
                className='material-icons audio-icon'>
                library_music
            </i>
            <h1>Upload your audio file here</h1>
            <button className='upload-btn' onClick={handleButtonClick}>
                Upload
            </button>
            <input
                type='file'
                id='file'
                ref={inputFile}
                style={{ display: 'none' }}
                accept='audio/*'
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default AudioUploader;
