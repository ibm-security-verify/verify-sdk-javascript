const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/evaluations/smsotp', (req, res) => {
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Extract parameters from request.
  const transactionId = req.body.transactionId;
  const otp = req.body.otp;

  // Verify an OTP factor.
  adaptive.evaluateSMSOTP(context, transactionId, otp)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
