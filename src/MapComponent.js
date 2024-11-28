import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import reliefCenterIconPath from './assets/marker-image.png';
import currentLocationIconPath from './assets/your_loc.png'; // Add your icon here

// Define custom icon for relief centers
const reliefCenterIcon = L.icon({
  iconUrl: reliefCenterIconPath,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Define custom icon for current location
const currentLocationIcon = L.icon({
  iconUrl: currentLocationIconPath, // Path to your "You Are Here" icon
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Dynamically center the map based on coordinates
const SetMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapComponent = () => {
  const [reliefCenters, setReliefCenters] = useState([]); // Relief centers data
  const [query, setQuery] = useState('food'); // Query for relief resources
  const [distance, setDistance] = useState(10); // Search radius
  const [lat, setLat] = useState(33.4255); // Default latitude (Tempe)
  const [lon, setLon] = useState(-111.94); // Default longitude (Tempe)
  const [currentLocation, setCurrentLocation] = useState(null); // User's current location
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch relief centers data based on user input
  const handleSearch = () => {
    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/search?q=${query}&lat=${lat}&lon=${lon}&distance=${distance}km`
      )
      .then((response) => {
        setReliefCenters(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching relief centers:', error);
        setLoading(false);
      });
  };

  // Load initial data when the component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  // Get and set current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLat(position.coords.latitude);
        setLon(position.coords.longitude);
      },
      (error) => console.error('Error fetching current location:', error)
    );
  }, []);

  // Generate markers for relief centers
  const reliefCenterMarkers = useMemo(() => {
    return reliefCenters.map((center, idx) => {
      const position = [
        center?._source?.location?.lat || 0,
        center?._source?.location?.lon || 0,
      ];
      return (
        <Marker key={idx} position={position} icon={reliefCenterIcon}>
          <Popup>
            <strong>{center?._source?.name || 'Unknown Name'}</strong>
            <br />
            {center?._source?.resources || 'No Resources Listed'}
            <br />
            {center?._source?.address || 'No Address Available'}
            <br />
            {center?._source?.contact || 'No Contact Information'}
          </Popup>
        </Marker>
      );
    });
  }, [reliefCenters]);

  return (
    <div>
      {/* Title */}
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Disaster Relief Centres</h1>

      {/* Search Bar */}
      <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <select
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          <option value="food">Food</option>
          <option value="medical aid">Medical Aid</option>
          <option value="water">Water</option>
          <option value="shelter">Shelter</option>
        </select>
        <input
          type="number"
          placeholder="Distance in km"
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value, 10))}
          style={{ padding: '10px', width: '150px', marginRight: '10px' }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Map */}
      <MapContainer center={[lat, lon]} zoom={12} style={{ height: '500px', width: '100%' }}>
        <SetMapView center={[lat, lon]} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {reliefCenterMarkers}
        {/* Current location marker */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lon]} icon={currentLocationIcon}>
            <Popup>You are here!</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
