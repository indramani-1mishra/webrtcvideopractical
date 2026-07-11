import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const GoogleMapUi = ({workerLocation}) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAVAAsaGnWItH1B-29rQAmY2FiHn22mTA8",
  });

  if (!isLoaded) return <div>Loading...</div>;
  

  return (
     

    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",backgroundColor: "#f0f0f0", padding: "20px", borderRadius: "10px"   }}>
      <h1>Google Map UI</h1>
      <GoogleMap
      mapContainerStyle={containerStyle}
      center={workerLocation}
      zoom={15}
    >
      <Marker position={workerLocation} />
    </GoogleMap>
    
    </div>
  );
};

export default GoogleMapUi;