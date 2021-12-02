const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/evaluations/fido', (req, res) => {
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Extract parameters from request.
  const transactionId = req.body.transactionId;
  const relyingPartyId = req.body.relyingPartyId;
  const authenticatorData = req.body.authenticatorData;
  const userHandle = req.body.userHandle;
  const signature = req.body.signature;
  const clientDataJSON = req.body.clientDataJSON;

  // Verify a FIDO factor.
  adaptive.evaluateFIDO(context, transactionId, relyingPartyId,
      authenticatorData, userHandle, signature, clientDataJSON)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
