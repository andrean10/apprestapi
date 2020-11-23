const express = require('express');
const app = express();
const logger = require('morgan');

app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));

app.use('/auth', require('./middleware/index'));

var routes = require('./routes');
routes(app);

app.listen(3000, () => {
    console.log(`Server started on port`);
});