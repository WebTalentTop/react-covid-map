import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import config from './settings';
import CaseService from './api/cases/routes';

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

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});
