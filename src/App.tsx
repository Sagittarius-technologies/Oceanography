import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import LoginWrapper from './components/login/LoginWrapper';  // Import the wrapper
import { AuthProvider } from './components/login/AuthContext';
import DnaExtraction from './components/processSection/Dnaextraction/DnaExtraction';
import Pcr from './components/processSection/PCR/Pcr';
import Sequencing from './components/processSection/Sequencing/Sequencing';
import SequenceMatching from './components/processSection/Sequencematching/SequenceMatching';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path='/dnaExtraction' element={<DnaExtraction/>} />  
          <Route path='/Pcr' element={<Pcr/>} />
          <Route path='/Sequencing' element={<Sequencing/>} />
          <Route path='/SequenceMatching' element={<SequenceMatching/>} />
  
        </Routes>
      </main>
      </AuthProvider>
    </BrowserRouter>
  );
}



export default App;
