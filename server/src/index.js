require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Import routes.
const programRoutes = require('./routes/programs');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');

// Mount the imported routes.
app.use('/api/v1', programRoutes);
app.use('/api/v1', registrationRoutes);
app.use('/api/v1', adminRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})