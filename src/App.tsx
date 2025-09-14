import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import LoginWrapper from './components/LoginWrapper';  // Import the wrapper
import { AuthProvider } from './components/AuthContext';
import DnaExtraction from './components/DnaExtraction';
import Pcr from './components/Pcr';
import Sequencing from './components/Sequencing';
import SequenceMatching from './components/SequenceMatching';

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginWrapper />} />
          <Route path='/dnaExtraction' element={<DnaExtraction/>} />  {/* Use the wrapper here */}
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
