import React, { useState, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import TableView from './TableView';
import MapView from './MapView';

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

export default function Main() {
  const [casesData, setCasesData] = useState([])
  const [timer, setTimer] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [value, setValue] = React.useState(0);

  async function updateCases () {
    try {
      const result = await fetch('http://localhost:5000/api/cases')
      const data = await result.json()
      setCasesData(data)
    } catch (e) {
      console.error(e)
    }
    clearTimeout(timer)
    setTimer(setTimeout(updateCases, 200))
  }

  async function onDelete(id) {
    if (id) {
      try {
        await fetch(`http://localhost:5000/api/cases/${id}`, { method: 'DELETE' })
      } catch (e) {
        console.error(e)
      }
    }
  }

  useEffect(() => {
    if (!isMounted) {
      updateCases()
      setIsMounted(true)
    }
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
          zoom={8}
          defaultRadius={20000}
          center={{ lat: 51.5287718, lng: -0.2416804 }}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TableView
          casesData={casesData}
          onDelete={onDelete}
        />
      </TabPanel>
    </Paper>
  )
}

