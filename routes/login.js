import 'dotenv/config'
import { Router } from 'express';
const router = Router();
import { randomBytes } from 'crypto';

router.base64URLEncode = function (str) {
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

router.get('/', (req, res) => {
  const state = router.base64URLEncode(randomBytes(64));
//   console.log(state)
  req.session.oauthState = state;
  res.redirect(`${process.env.FUSIONLINK}/oauth2/authorize?client_id=${process.env.CLIENTID}&redirect_uri=${process.env.REDIRECTURI}&response_type=code&state=${state}`);

});
//
router.get('/oauth-callback', (req, res, next) => {
 // Verify the state
 const reqState = req.query.state;
 const state = req.session.oauthState;
 if (reqState !== state) {
   res.redirect('/', 302); // Start over
   return;
 }
});


export default router;