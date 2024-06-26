require('dotenv').config();
require('./db/db-config');
const express = require('express');
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3099;

app.use('/api/v1/smartcontract', require('./routes/mainRoutes'));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});