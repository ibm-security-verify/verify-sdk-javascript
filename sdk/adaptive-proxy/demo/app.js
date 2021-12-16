const reservationsRouter = require(
    './components/reservations/reservationsRouter');
const assessPolicy = require('./components/a2/assessPolicy');
const evaluateFIDO = require('./components/a2/evaluateFIDO');
const evaluateTOTP = require('./components/a2/evaluateTOTP');
const evaluateEmailOTP = require('./components/a2/evaluateEmailOTP');
const evaluateSMSOTP = require('./components/a2/evaluateSMSOTP');
const evaluateQR = require('./components/a2/evaluateQR');
const evaluateQuestions = require('./components/a2/evaluateQuestions');
const evaluatePassword = require(
    './components/a2/evaluatePassword');
const evaluatePush = require(
    './components/a2/evaluatePush');
const generateEmailOTP = require('./components/a2/generateEmailOTP');
const generateFIDO = require('./components/a2/generateFIDO');
const generatePush = require('./components/a2/generatePush');
const generateQR = require('./components/a2/generateQR');
const generateQuestions = require('./components/a2/generateQuestions');
const generateSMSOTP = require('./components/a2/generateSMSOTP');
const logout = require('./components/a2/logout');

const express = require('express');


const app = express();
app.use(express.json(),
    reservationsRouter,
    assessPolicy,
    evaluateFIDO,
    evaluateTOTP,
    evaluateEmailOTP,
    evaluateSMSOTP,
    evaluateQR,
    evaluateQuestions,
    evaluatePassword,
    evaluatePush,
    generateEmailOTP,
    generateFIDO,
    generatePush,
    generateQR,
    generateQuestions,
    generateSMSOTP,
    logout);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
