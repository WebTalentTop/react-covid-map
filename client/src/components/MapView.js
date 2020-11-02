import React, { useState, useEffect } from "react";
import { Map, TileLayer, Marker, Circle, Popup, Rectangle } from "react-leaflet";
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ReactLeafletSearch from "react-leaflet-search";
import L from 'leaflet';

const useStyles = makeStyles({
  text: {
    width: '100%',
    marginBottom: 16,
    marginRight: 16
  }
});

export default function MapView({ center, zoom, defaultRadius, casesData }) {
  const classes = useStyles();
  const [currentPos, setCurrentPos] = useState(center);
  const [radius, setRadius] = useState(defaultRadius);
  const [total, setTotal] = useState(0);
  const [totalRect, setTotalRect] = useState(0);
  const [cityState, setCityState] = useState('');
  const [bounds, setBounds] = useState([]);
  const [boundOptions, setBoundOptions] = useState([]);

  const handleClick = e => {
    setCurrentPos(e.latlng);
  }

  useEffect(() => {
    if (!currentPos) return;

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

  useEffect(() => {
    async function getBounds() {
      try {
        const result = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${cityState}&polygon_geojson=1&format=jsonv2`)
        const data = await result.json();
        setBoundOptions(data.map(item => Object.assign({}, { title: item.display_name, payload: JSON.stringify(item) })))
      } catch (e) {
        console.error(e)
      }
    }
    getBounds();
  }, [cityState]);

  useEffect(() => {
    if (bounds.length > 0) {
      const rangeData = casesData
        .filter(item => 
            item.lat>bounds[0][0] &&
            item.lng>bounds[0][1] &&
            item.lat<bounds[1][0] &&
            item.lng<bounds[1][1]
        );
      const sum = rangeData.length > 0 && rangeData
        .map(item => item.count)
        .reduce((prev, curr) => prev + curr, 0);
      const total = sum > 0 ? sum : 0;
      setTotalRect(total);
    }
  }, [bounds, casesData]);

  const handleBounds = (v) => {
    const boundArr = v && v.payload && JSON.parse(v.payload).boundingbox;
    setBounds([]);
    if (Array.isArray(boundArr) && boundArr.length>0) {
      setBounds([ [boundArr[0], boundArr[2]], [boundArr[1], boundArr[3]] ]);
    }
  }
  
  return (
    <div>
      <Autocomplete
        id="combo-box-demo"
        className={classes.text}
        options={boundOptions}
        getOptionLabel={(option) => option.title}
        onChange={(e, v) => handleBounds(v)}
        onInputChange={(event, newInputValue) => {
          setCityState(newInputValue);
        }}
        style={{ width: 300 }}
        renderInput={(params) =>
          <TextField
            {...params}
            label="Select city and state"
          />
        }
      />
      <TextField
        label="Range"
        type="number"
        defaultValue={radius}
        className={classes.text}
        onChange={e => setRadius(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <br />
      <h2>Total Cases in circle range: {total}</h2>
      <h2>Total Cases in rectangle range: {totalRect}</h2>
      <br />
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
        {bounds.length > 0 &&
          <Rectangle bounds={bounds} />
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
