import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TableView from './TableView';
import MapView from './MapView';
import { isEmpty, isEqual, xorWith } from 'lodash';
import L from 'leaflet';

import socketIOClient from "socket.io-client"

const ENDPOINT = `https://boiling-tor-57674.herokuapp.com`;
const socket = socketIOClient(ENDPOINT);
const isArrayEqual = (x, y) => isEmpty(xorWith(x, y, isEqual));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const mapConfig = {
  zoom: 12,
  center: { lat: 40.719176490550595, lng: -73.98377895355226 },
  radius: 3000
};

const LeafIcon = L.Icon.extend({
  options: {
    iconSize:     [38, 95],
    shadowSize:   [50, 64],
    iconAnchor:   [22, 94],
    shadowAnchor: [4, 62],
    popupAnchor:  [-3, -76]
  }
});

const greenIcon = new LeafIcon({
  iconUrl: 'http://leafletjs.com/examples/custom-icons/leaf-green.png',
  shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png'
});

export default function Main() {
  const [casesData, setCasesData] = useState([])
  const [value, setValue] = React.useState(0);

  async function onDelete(id) {
    socket.emit("delete-record", id);
  }

  async function onUpdate(record) {
    socket.emit("edit-record", record);
  }

  async function onAdd(record) {
    socket.emit("add-record", record);
  }

  useEffect(() => {
    socket.on("FromAPI", data => {
      if (!isArrayEqual(data, casesData)) 
        setCasesData(data);
    });
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Paper square>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="disabled tabs example"
      >
        <Tab label="Map View" />
        <Tab label="Edit View" />
      </Tabs>
      <TabPanel value={value} index={0}>
        <MapView
          casesData={casesData}
          zoom={mapConfig.zoom}
          defaultRadius={mapConfig.radius}
          center={mapConfig.center}
          greenIcon={greenIcon}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TableView
          casesData={casesData}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onAdd={onAdd}
          zoom={mapConfig.zoom}
          center={mapConfig.center}
          greenIcon={greenIcon}
        />
      </TabPanel>
    </Paper>
  )
}

