const auth = require('./auth');
const express = require('express');
const route = express.Router();

module.exports = route.post('/api/v1/register', auth.register);
module.exports = route.post('/api/v1/login', auth.login);