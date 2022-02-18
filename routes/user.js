const express = require('express');
const router = express.Router();
// const config = require('../../client/src/config');

router.get('/', (req, res) => {
  res.send({
    user: {
      email: 'test@fusionauth.io'
    }
  });
});

module.exports = router;