require('dotenv').config()

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Import the route paths.
const programRoutes = require('./endpoint.js');
app.use('/api/v1', programRoutes);

app.listen(port, () => {
    console.log('Server running on http://localhost:3000')
})