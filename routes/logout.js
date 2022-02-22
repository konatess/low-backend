import 'dotenv/config'
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  // delete the session
  req.session.destroy();

  // end FusionAuth session
  res.redirect(`${process.env.FUSIONLINK}/oauth2/logout?client_id=${process.env.CLIENTID}`);
});

export default router;