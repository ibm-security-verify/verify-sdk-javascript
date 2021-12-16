const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/generations/fido', (req, res) => {
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Extract parameters from request.
  const transactionId = req.body.transactionId;
  const relyingPartyId = req.body.relyingPartyId;
  const userId = req.body.userId;

  // Request a FIDO verification.
  adaptive.generateFIDO(context, transactionId, relyingPartyId, userId)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
