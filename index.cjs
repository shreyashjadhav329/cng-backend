const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sheetsRouter = require('./sheetsrouter.cjs');

dotenv.config(); // ✅ Load .env file

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use('/api', sheetsRouter);

// ✅ Root Test Route
app.get('/', (req, res) => {
  res.send('✅ Google Sheets backend is running!');
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

