const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require('jsonwebtoken');
var fs = require('fs');

//route imports
const userRouter = require('./routes/user.route');
const subjectRouter = require('./routes/subject.route');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT

mongoose.connect(process.env.DB_URL);
const connection = mongoose.connection;

app.listen(port, () => {
    connection.once('open', () => {
        console.log(`Server started at ${port}, MongoDB connected Successfully`);
    });
});

app.get("/", (req, res) => {
    res.json("It's Working");
})

// END POINTS
app.use('/api/user', userRouter);
app.use('/api/subject', subjectRouter);