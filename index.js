require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute');
const recoverRoute = require('./routes/reset');
const mongoString = process.env.DATABASE_URL;
const app = express();

mongoose.connect(mongoString);
const database = mongoose.connection;
const port = process.env.PORT || 3000;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.listen(port, () => {
    console.log(`Server Started at ${port}`)
})

app.use(express.json());
app.use(bodyParser.json());
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/reset', recoverRoute);