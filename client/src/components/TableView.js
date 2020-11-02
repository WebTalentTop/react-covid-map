import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import Button from '@material-ui/core/Button';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import { Map, TileLayer, Marker, Popup, Rectangle } from "react-leaflet";
import ReactLeafletSearch from "react-leaflet-search";
import DeleteDialog from './DeleteDialog';
import Autocomplete from '@material-ui/lab/Autocomplete';

const columns = [
  { id: 'date', label: 'Last Update', minWidth: 170},
  { id: 'location', label: 'Location', minWidth: 170 },
  { id: 'count', label: 'Cases', minWidth: 170 },
  { id: 'actions', label: 'Actions', minWidth: 170 },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
  content: {
    padding: 16
  },
  text: {
    width: '100%',
    marginBottom: 16,
    marginRight: 16
  }
});

const WAIT_INTERVAL = 1000;
let timerID;

const TableView = function ({ casesData, onDelete, onAdd, onEdit, zoom, center }) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDelete, setOpenDelete] = React.useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [currentPos, setCurrentPos] = useState(center);
  const [currentCount, setCurrentCount] = useState(0);
  const [currentLocation, setCurrentLocation] = useState('');
  const [cityState, setCityState] = useState('');
  const [bounds, setBounds] = useState([]);
  const [boundOptions, setBoundOptions] = useState([]);
  const [rangeData, setRangeData] = useState([]);

  async function getAddress(latlng) {
    try {
      const result = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`)
      const data = await result.json();
      if (data && data.address) {
        setCurrentLocation(data.display_name)
      }
    } catch (e) {
      console.error(e)
    }
  }

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
      const rangeDataFiltered = casesData
        .filter(item => 
            item.lat>bounds[0][0] &&
            item.lng>bounds[0][1] &&
            item.lat<bounds[1][0] &&
            item.lng<bounds[1][1]
        );
      setRangeData(rangeDataFiltered);
    } else {
      setRangeData(casesData);
    }
  }, [bounds, casesData]);

  const handleClick = e => {
    setCurrentPos(e.latlng);
    getAddress(e.latlng);
  }

  const handleClickOpenDelete = (id) => {
    setOpenDelete(true);
    setCurrentId(id);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const handleDelete = () => {
    setOpenDelete(false);
    onDelete(currentId);
  }

  const handleAddNew = () => {
    const newRecord = {
      location: currentLocation,
      count: currentCount,
      lat: currentPos.lat,
      lng: currentPos.lng,
    }
    onAdd(newRecord);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleBounds = (v) => {
    const boundArr = v && v.payload && JSON.parse(v.payload).boundingbox;
    if (Array.isArray(boundArr) && boundArr.length>0) {
      setBounds([ [boundArr[0], boundArr[2]], [boundArr[1], boundArr[3]] ]);
    } else setBounds([])
  }

  const handleSearch = (newInputValue) => {
    clearTimeout(timerID)
    timerID = setTimeout(() => {
      setCityState(newInputValue);
    }, WAIT_INTERVAL)
  }

  const sum = rangeData.length > 0 && rangeData
    .map(item => item.count)
    .reduce((prev, curr) => prev + curr, 0);
  const total = sum > 0 ? sum : 0;

  return (
    <div className={classes.root}>
      <Autocomplete
        id="combo-box-demo1"
        className={classes.text}
        options={boundOptions}
        getOptionLabel={(option) => option.title}
        onChange={(e, v) => handleBounds(v)}
        onInputChange={(event, newInputValue) => {
          handleSearch(newInputValue);
        }}
        style={{ width: 300 }}
        renderInput={(params) =>
          <TextField
            {...params}
            label="Select city and state"
          />
        }
      />
      <h2>Total Cases in rectangle range: {total}</h2>
      <Map center={center} zoom={zoom} onClick={handleClick}>
        <TileLayer
            url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {currentPos &&
          <Marker position={currentPos}>
            <Popup position={currentPos}>
              Current location: <pre>{JSON.stringify(currentPos, null, 2)}</pre>
            </Popup>
          </Marker>
        }
        {bounds.length > 0 &&
          <Rectangle bounds={bounds} />
        }
        <ReactLeafletSearch
          position="topright"
          onChange={(info) => {
            setCurrentPos(info.latLng);
            setCurrentLocation(info.info);
          }}
        />
      </Map>
      <section className={classes.content}>
        <TextField
          label="Location"
          value={currentLocation}
          className={classes.text}
          onChange={e => setCurrentLocation(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Latitude"
          type="number"
          className={classes.text}
          value={currentPos && currentPos.lat}
          onChange={e => setCurrentPos(e.target.value, currentPos.lng)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Longitude"
          type="number"
          className={classes.text}
          value={currentPos && currentPos.lng}
          onChange={e => setCurrentPos(currentPos.lat, e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Count"
          type="number"
          className={classes.text}
          value={currentCount}
          onChange={e => setCurrentCount(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button onClick={handleAddNew} color="primary">
          Add New
        </Button>
      </section>
      <DeleteDialog
        open={openDelete}
        handleClose={handleCloseDelete}
        handleDelete={handleDelete}
      />
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(rangeData) && rangeData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    if (column.id === 'date') {
                      return <TableCell key={`${column.id}-${row._id}`} align={column.align}>
                        {moment(new Date(value)).format('YYYY/MM/DD HH:mm:ss').toString()}
                      </TableCell>
                    } else if (column.id !== 'actions') {
                      return (
                        <TableCell key={`${column.id}-${row._id}`} align={column.align}>
                          {column.format && typeof value === 'number' ? column.format(value) : value}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={`action-${row._id}`}>
                          <Button onClick={() => {}} color="primary">
                            Edit
                          </Button>
                          <Button onClick={() => handleClickOpenDelete(row._id)} color="primary">
                            Delete
                          </Button>
                        </TableCell>
                      )
                    }
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rangeData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
}

const comparisonFn = function (prevProps, nextProps) {
  return prevProps.casesData === nextProps.casesData;
};

export default React.memo(TableView, comparisonFn);