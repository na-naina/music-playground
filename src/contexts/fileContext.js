import React, { createContext, useState, useEffect } from 'react';

const FileContext = createContext();

const FileContextProvider = ({ children }) => {
    const [fileURL, setFileURL] = useState('');
    const [midiPath, setMidiPath] = useState('');
    const [error, setError] = useState('');
    const [resetSignal, setResetSignal] = useState(false);

    const resetAllModules = () => {
        setFileURL('');
        setMidiPath('');
        setError('');
        setResetSignal(prev => !prev); // Toggle the reset signal
    };

    return (
        <FileContext.Provider value={{ fileURL, setFileURL, midiPath, setMidiPath, error, setError, resetSignal, resetAllModules }}>
            {children}
        </FileContext.Provider>
    );
};

export { FileContext, FileContextProvider };
