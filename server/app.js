import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import config from './settings';
import CaseService from './api/cases/routes';
import Case from './api/cases/model';

const { ObjectId } = mongoose.Types;

const socketIO = require("socket.io");
const http = require("http");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.set('useCreateIndex', true);

const db = mongoose.connection;
db.on('error', () => {});
db.once('open', () => {
  console.log('Database Conencted!');
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, DELETE');
  next();
});

app.use('/api/cases', CaseService);

// const PORT = 5000;
const SOCKET_PORT = process.env.port || 7000;
let interval;

// app.listen(PORT, () => {
//   console.log(`API server is running on port ${PORT}`);
// });

const server = http.createServer(app);
const io = socketIO(server);
io.on("connection", socket => {
  if (interval) {
    clearInterval(interval);
  }
  console.log("New client connected" + socket.id);
  interval = setInterval(() => getApiAndEmit(socket), 1000);

  socket.on("delete-record", recordId => {
    Case.findOne({ _id: recordId }, (err, record) => {
      if (err || !record) {
        socket.emit('failed to fetch record');
      } else {
        record.remove((removeErr) => {
          if (removeErr) {
            socket.emit(removeErr);
          } else {
            socket.emit({ status: 'success' });
          }
        });
      }
    });
  });

  socket.on("edit-record", record => {
    const {
      date,
      location,
      count,
      lat,
      lng,
      _id,
    } = record;
  
    const recordId = new ObjectId(_id);
    Case.findOne({ _id: recordId }, { _id: false }, (err, record) => {
      if (err || !record) {
        socket.emit('Failed to fetch record');
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
          socket.emit(updateErr);
        } else {
          socket.emit({ status: 'success' });
        }
      });
    });
  });

  socket.on("add-record", record => {
    
    const {
      location, count, lat, lng
    } = record;
  
  
    if (!location || !count || !lat || !lng) {
      socket.emit('Missing Parameters');
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
        socket.emit({
          status: 'success',
          data,
        });
        return;
      }
      socket.emit('Cannot save');
    });

  });
  
  socket.on("disconnect", () => {
    console.log("user disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = socket => {
  Case.find({}).then(data => {
    socket.emit("FromAPI", data);
  })
};

server.listen(SOCKET_PORT, () => console.log(`Listening on port ${SOCKET_PORT}`));