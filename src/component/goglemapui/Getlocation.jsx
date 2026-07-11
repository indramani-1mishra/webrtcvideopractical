import { useEffect, useState } from "react";
import GoogleMapUi from "./GoogleMapUi";
const params={
  name:"test",
  page:1,
  limit:10,
};
import { useNavigate } from "react-router-dom"; 

//import TestUrlSearchparam from "./TestUrlSearchparam.jsx";
function Getlocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error:", error.message);
      }
    );
  }, []);

  const handleClick = (params) => {
    console.log("Navigating to TestUrlSearchparam with params:", params);
    navigate(`/testurlsearchparam?${new URLSearchParams(params).toString()}`);
  }

  return (
    <div>
      <button onClick={() => handleClick({page: 1, limit: 10, name: "test"})}
       >
       checkTestUrlSearchparam
      </button>
      <h2>User Location</h2>  
       <GoogleMapUi workerLocation={{ lat: location.latitude, lng: location.longitude }} />
    </div>
  );
}

export default Getlocation;