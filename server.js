const express = require('express');
const app = express();
const logger = require('morgan');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));

app.use('/uploads', express.static('uploads'));

var routes = require('./routes');
routes(app);

app.listen(3000, () => {
    console.log(`Server started on port`);
});