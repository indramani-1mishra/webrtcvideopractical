import React, { useEffect } from 'react';
import { Route,Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import GoogleMapUi from './component/goglemapui/GoogleMapUi.jsx';
import Getlocation from './component/goglemapui/Getlocation.jsx';
import TestUrlSearchparam from './component/goglemapui/TestUrlSearchparam.jsx';
import VideCallSection from './component/goglemapui/videcallsection.jsx';

// 1. Initialize the socket outside the component 
// so it is created only once.
 export const socket = io('http://localhost:3000');

export default function App() {
return (
    <div>
      <Routes>
        <Route path="/googlemapui" element={<GoogleMapUi />} /> 
        <Route path="/getlocation" element={<Getlocation />} />
        <Route path="/testurlsearchparam" element={<TestUrlSearchparam  />} />
        <Route path="/videocallsection" element={<VideCallSection />} />
      </Routes>
    </div>
  );
}