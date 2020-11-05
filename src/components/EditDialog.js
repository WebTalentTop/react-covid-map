import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles({
  text: {
    width: '100%',
    marginBottom: 16,
    marginRight: 16
  }
});


export default function EditDialog({ open, handleClose, handleEdit, record, currentId, setEdit }) {
  const classes = useStyles();
  // const [currentLocation, setCurrentLocation] = useState('');
  // const [currentCount, setCurrentCount] = useState(0);
  // const [currentLat, setCurrentLat] = useState(0);
  // const [currentLng, setCurrentLng] = useState(0);

  // useEffect(() => {
  //   if (record && record.location) setCurrentLocation(record.location);
  //   if (record && record.count) setCurrentCount(record.count);
  //   if (record && record.lat) setCurrentLat(record.lat);
  //   if (record && record.lng) setCurrentLng(record.lng);
  // }, [record]);
  
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Edit form</DialogTitle>
        <DialogContent>
        <TextField
          label="Location"
          value={record && record.location}
          className={classes.text}
          onChange={e => setEdit({ location: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Latitude"
          type="number"
          className={classes.text}
          value={record && record.lat}
          onChange={e => setEdit({ lat: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Longitude"
          type="number"
          className={classes.text}
          value={record && record.lng}
          onChange={e => setEdit({ lng: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          label="Count"
          type="number"
          className={classes.text}
          value={record && record.count}
          onChange={e => setEdit({ count: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleEdit({
            _id: currentId,
            location: record && record.location,
            count: record && record.count,
            lat: record && record.lat,
            lng: record && record.lng,
          })} color="primary" autoFocus>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}