import React, { useState } from "react";
import { Map, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import TextField from '@material-ui/core/TextField';
import ReactLeafletSearch from "react-leaflet-search";

export default function MapView({ center, zoom, defaultRadius }) {

  const [currentPos, setCurrentPos] = useState(null);
  const [radius, setRadius] = useState(defaultRadius);

  const handleClick = e => {
    setCurrentPos(e.latlng);
  }
  
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
              setCurrentPos(info.latLng)
          }}
        />
      </Map>
    </div>
  )
}
