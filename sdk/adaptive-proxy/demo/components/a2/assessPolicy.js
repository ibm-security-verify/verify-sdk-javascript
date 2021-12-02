const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/assessments', (req, res) => {
  // Extract parameters from request.
  const sessionId = req.body.sessionId;
  const userAgent = req.headers['user-agent'];
  const ipAddress = req.ip;
  const evaluationContext = req.body.evaluationContext;
  const context = {sessionId, userAgent, ipAddress,
    evaluationContext};

  // Perform a risk assessment.
  adaptive.assessPolicy(context)
      .then((result) => {
        res.send(result);
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
