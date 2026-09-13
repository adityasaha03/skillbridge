const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(` SkillBridge Auth Server is running!`);
      console.log(` Port:    ${PORT}`);
      console.log(` Mode:    ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health:  http://localhost:${PORT}/api/v1/health`);
      console.log(` Auth:    http://localhost:${PORT}/api/v1/auth`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error.message);
    process.exit(1);
  }
};

startServer();
