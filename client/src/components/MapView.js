import React, { useState, useEffect } from "react";
import { Map, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import TextField from '@material-ui/core/TextField';
import ReactLeafletSearch from "react-leaflet-search";
import L from 'leaflet';

export default function MapView({ center, zoom, defaultRadius, casesData }) {

  const [currentPos, setCurrentPos] = useState(center);
  const [radius, setRadius] = useState(defaultRadius);
  const [total, setTotal] = useState(0);

  const handleClick = e => {
    setCurrentPos(e.latlng);
  }

  useEffect(() => {
    const latlngA = new L.LatLng(currentPos.lat, currentPos.lng);
    
    const availableData = casesData.filter(record => record.lat && record.lng);
    if (availableData.length > 0) {
      const rangeData = availableData
        .filter(item => {
          const latlngRecord = new L.LatLng(item.lat, item.lng);
          return latlngA.distanceTo(latlngRecord) < radius
        });
      const sum = rangeData.length > 0 && rangeData
        .map(item => item.count)
        .reduce((prev, curr) => prev + curr, 0);
      const total = sum > 0 ? sum : 0;
      setTotal(total);
    }
  }, [radius, currentPos, casesData]);
  
  return (
    <div>
      <TextField
        label="Range"
        type="number"
        defaultValue={radius}
        onChange={e => setRadius(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <br /><br />
      <h2>Total Cases: {total}</h2>
      <Map center={center} zoom={zoom} onClick={handleClick}>
        <TileLayer
            url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {currentPos &&
          <Marker position={currentPos}>
            <Popup position={currentPos}>
              Current location: <pre>{JSON.stringify(currentPos, null, 2)}</pre>
            </Popup>
            <Circle 
              center={{lat: currentPos.lat, lng: currentPos.lng}}
              fillColor="blue" 
              radius={radius}
            />
          </Marker>
        }
        <ReactLeafletSearch
            position="topright"
            onChange={(info) => {
              setCurrentPos(info.latLng);
          }}
        />
      </Map>
    </div>
  )
}
