import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import TableView from './TableView';

export default function Main() {
  const [casesData, setCasesData] = useState([])
  const [timer, setTimer] = useState(null)
  const [isMounted, setIsMounted] = useState(false)


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

  useEffect(() => {
    if (!isMounted) {
      updateCases()
      setIsMounted(true)
    }
  })

  return (
    <Tabs>
      <TabList>
        <Tab>Map View</Tab>
        <Tab>Table View</Tab>
      </TabList>

      <TabPanel>
      </TabPanel>
      <TabPanel>
        <TableView casesData={casesData} />
      </TabPanel>
    </Tabs>
  )
}

