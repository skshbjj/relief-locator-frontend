import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import customIconPath from './assets/marker-image.png';

// Define the custom icon for relief centers
const customIcon = L.icon({
  iconUrl: customIconPath,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to dynamically center the map
const SetMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapComponent = () => {
  const [reliefCenters, setReliefCenters] = useState([]); // Relief center data
  const [query, setQuery] = useState('food'); // Search query (e.g., "food")
  const [distance, setDistance] = useState(10); // Search radius in km
  const [lat, setLat] = useState(33.4255); // Latitude (default: Tempe)
  const [lon, setLon] = useState(-111.9400); // Longitude (default: Tempe)
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch relief center data based on the query and location
  const handleSearch = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/search?q=food&lat=33.4255&lon=-111.9400&distance=10km`)
      .then((response) => {
        console.log('Fetched Data:', response.data);
        setReliefCenters(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  // Load initial data when the component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  // Create markers for relief centers
  const markers = useMemo(() => {
    console.log('Markers Data:', reliefCenters);
    return reliefCenters.map((center, idx) => {
      const position = [
        center?._source?.location?.lat || 0,
        center?._source?.location?.lon || 0,
      ];

      return (
        <Marker key={idx} position={position} icon={customIcon}>
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

  // Render map and search UI
  return (
    <div>
      {/* Search Bar */}
      <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center' }}>
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
        <input
          type="number"
          placeholder="Latitude"
          value={lat}
          onChange={(e) => setLat(parseFloat(e.target.value))}
          style={{ padding: '10px', width: '150px', marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={lon}
          onChange={(e) => setLon(parseFloat(e.target.value))}
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
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setLat(position.coords.latitude);
                setLon(position.coords.longitude);
                handleSearch(); // Trigger search after updating location
              },
              (error) => console.error("Error fetching location:", error)
            );
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
        >
          Use My Location
        </button>
      </div>

      {/* Map */}
      <MapContainer center={[lat, lon]} zoom={12} style={{ height: '500px', width: '100%' }}>
        <SetMapView center={[lat, lon]} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {markers}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
