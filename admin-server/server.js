const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Admin Server: MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/messages', require('./routes/messageRoutes'));

const AppError = require('./utils/appError');
const globalErrorHandler = require('./middleware/errorMiddleware');

// 404 Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Middleware
app.use(globalErrorHandler);

app.get('/', (req, res) => {
    res.send('Admin API is running...');
});

app.listen(PORT, () => console.log(`Admin Server running on port ${PORT}`));
