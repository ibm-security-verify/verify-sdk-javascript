const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/evaluations/push', (req, res) => {
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Extract parameters from request.
  const transactionId = req.body.transactionId;
  const accessToken = req.body.accessToken;
  const userAction = req.body.userAction;
  const signedData = req.body.signedData;

  // Request a push verification.
  adaptive.evaluatePush(context, transactionId, accessToken, userAction,
      signedData)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
