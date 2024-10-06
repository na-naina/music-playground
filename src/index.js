import React from 'react';
import { createRoot } from 'react-dom';
import './index.css';
import App from './App';
import { FileContextProvider } from './contexts/fileContext';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FileContextProvider>
      <App />
    </FileContextProvider>
  </React.StrictMode>
);

reportWebVitals();
