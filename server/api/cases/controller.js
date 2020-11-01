/* eslint-disable no-underscore-dangle */
import { Types } from 'mongoose';
import Case from './model';

const { ObjectId } = Types;

const getRecords = (req, res) => {
  Case.find({}, {}, {
  }, (err, records) => {
    if (err) {
      res.status(400).send('Cannot find data');
      return;
    }
    res.json(records);
  });
};

const addRecord = (req, res) => {
  const { body } = req;

  const {
    location, count, lat, lng
  } = body;


  if (!location || !count || !lat || !lng) {
    res.status(400).send('Missing Parameters');
    return;
  }

  const newCase = new Case({
    date: new Date(),
    location,
    count,
    lat,
    lng
  });

  newCase.save((err, data) => {
    if (!err) {
      res.json({
        status: 'success',
        data,
      });
      return;
    }
    res.status(400).send('Cannot save');
  });
};

const deleteRecord = (req, res) => {
  const {
    params: {
      id,
    },
  } = req;
  // eslint-disable-next-line no-underscore-dangle
  const recordId = new ObjectId(id);
  Case.findOne({ _id: recordId }, (err, record) => {
    if (err || !record) {
      res.status(404).send('failed to fetch record');
    } else {
      record.remove((removeErr) => {
        if (removeErr) {
          res.status(400).send(removeErr);
        } else {
          res.json({ status: 'success' });
        }
      });
    }
  });
};

const updateRecord = (req, res) => {
  const {
    body: {
      date,
      location,
      count,
      lat,
      lng
    },
    params: {
      id,
    },
  } = req;

  const recordId = new ObjectId(id);
  Case.findOne({ _id: recordId }, { _id: false }, (err, record) => {
    if (err || !record) {
      res.status(404).send('Failed to fetch record');
      return;
    }

    const newRecord = Object.assign(record, {
      date,
      location,
      count,
      lat,
      lng
    });

    const newDate = new Date(date);

    newRecord.date = newDate;

    Case.updateOne({ _id: recordId }, { $set: newRecord }, (updateErr) => {
      if (updateErr) {
        res.status(400).send(updateErr);
      } else {
        res.json({ status: 'success' });
      }
    });
  });
};

export default {
  getRecords,
  addRecord,
  deleteRecord,
  updateRecord,
};
