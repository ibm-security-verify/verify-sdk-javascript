const adaptive = require('./adaptive');

const express = require('express');


// eslint-disable-next-line new-cap
const router = express.Router();

router.post('/logout', (req, res) => {
  // Extract parameters from request.
  const accessToken = req.body.access_token;

  // Logout (i.e. revoke the access token).
  adaptive.logout(accessToken)
      .then(() =>{
        res.send();
      }).catch((error) => {
        console.log(error);
        res.status(404).send({error: error.message});
      });
});

module.exports = router;
