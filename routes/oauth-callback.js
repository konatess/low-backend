import 'dotenv/config'
import { Router } from 'express';
const router = Router();
import request from 'request';

router.get('/', (req, res) => {
    
    const options = {
        method: 'POST',
        uri: `${process.env.FUSIONLINK}/oauth2/token`,
        form: {
          'client_id': process.env.CLIENTID,
          'client_secret': process.env.CLIENTSECRET,
          'code': req.query.code,
          'grant_type': 'authorization_code',
          'redirect_uri': process.env.REDIRECTURI
        }
    }
    const callback = (error, response, body) => {
        // save token to session
        req.session.token = JSON.parse(body).access_token;
  
        // redirect to the React app
        res.redirect(`http://localhost:${process.env.CLIPORT}`);
    }
    request(options, callback);
});

export default router;