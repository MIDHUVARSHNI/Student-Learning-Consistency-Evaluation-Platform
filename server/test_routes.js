const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Route Imports...');

try {
    console.log('Testing authRoutes...');
    const authRoutes = require('./routes/authRoutes');
    console.log('authRoutes loaded');

    console.log('Testing activityRoutes...');
    const activityRoutes = require('./routes/activityRoutes');
    console.log('activityRoutes loaded');

    console.log('Testing analyticsRoutes...');
    const analyticsRoutes = require('./routes/analyticsRoutes');
    console.log('analyticsRoutes loaded');

    console.log('Testing educatorRoutes...');
    const educatorRoutes = require('./routes/educatorRoutes');
    console.log('educatorRoutes loaded');

    console.log('Testing feedbackRoutes...');
    const feedbackRoutes = require('./routes/feedbackRoutes');
    console.log('feedbackRoutes loaded');

    console.log('Testing messageRoutes...');
    const messageRoutes = require('./routes/messageRoutes');
    console.log('messageRoutes loaded');

    console.log('All routes loaded successfully!');
} catch (error) {
    console.error('FAILED TO LOAD ROUTE:', error);
}
