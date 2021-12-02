const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/generations/push', (req, res) => {
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Extract parameters from request.
  const transactionId = req.body.transactionId;
  const signatureId = req.body.signatureId;
  const authenticatorId = req.body.authenticatorId;
  const message = req.body.message;
  const originIpAddress = req.ip;
  const originUserAgent = req.headers['user-agent'];
  const pushNotificationMessage = req.body.pushNotificationMessage;
  const additionalData = req.body.additionalData;

  // Request a push verification.
  adaptive.generatePush(context, transactionId, signatureId,
      authenticatorId, message, originIpAddress,
      originUserAgent, pushNotificationMessage, additionalData)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
