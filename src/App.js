import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AudioPage from './pages/AudioPage';
import MidiPage from './pages/MidiPage';
import Navbar from './components/Navbar';
import './App.css'; 

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/audio' element={<AudioPage />} />
        <Route path='/midi' element={<MidiPage />} />
      </Routes>
    </Router>
  );
};

export default App;
