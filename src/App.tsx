import { Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import GoogleMapUi from './component/goglemapui/GoogleMapUi';
import Getlocation from './component/goglemapui/Getlocation';
import TestUrlSearchparam from './component/goglemapui/TestUrlSearchparam';
import VideCallSection from './component/goglemapui/videcallsection';

// 1. Initialize the socket outside the component 
// so it is created only once.

const mode ="production";
const url= mode==="production"?"https://implement-ci-cd-test.onrender.com":"http://localhost:5173";
console.log(url);
 export const socket = io(url);

export default function App() {
return (
    <div>
      <Routes>
        <Route path="/" element={<VideCallSection />} />
        <Route path="/googlemapui" element={<GoogleMapUi />} /> 
        <Route path="/getlocation" element={<Getlocation />} />
        <Route path="/testurlsearchparam" element={<TestUrlSearchparam  />} />
        <Route path="/videocallsection" element={<VideCallSection />} />
      </Routes>
    </div>
  );
}