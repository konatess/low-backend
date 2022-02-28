import 'dotenv/config'
import { Router } from 'express';
import request from 'request';
import databaseMethods from '../controllers/databaseMethods.js';
// import user from '../models/user.js';
const router = Router();

router.get('/', (req, res) => {
	// token in session -> get user data and send it back to the react app
	if (req.session.token) {
		request(
			// POST request to /introspect endpoint
			{
				method: 'POST',
				uri: `${process.env.FUSIONLINK}/oauth2/introspect`,
				form: {
					'client_id': process.env.CLIENTID,
					'token': req.session.token
				}
			},

			// callback
			(error, response, body) => {
				let introspectResponse = JSON.parse(body);

				// valid token -> get more user data and send it back to the react app
				if (introspectResponse.active) {
					request(
						// GET request to /registration endpoint
						{
							method: 'GET',
							uri: `${process.env.FUSIONLINK}/api/user/registration/${introspectResponse.sub}/${process.env.APPID}`,
							json: true,
							headers: {
								'Authorization': process.env.AUTHAPIKEY
							}
						},

						// callback
						async (error, response, body) => {
							const dbResponse = await databaseMethods.userSignIn(body.registration.id);
							res.send(
								{
									db: {
										dbUser: {
											id: dbResponse.dbUser.id,
											displayName: dbResponse.dbUser.displayName
										},
										created: dbResponse.created
									},
									user: {
										...introspectResponse,
									},
									...body
								}
							);
						}
					);
				}

				// expired token -> send nothing
				else {
					req.session.destroy();
					res.send({});
				}
			}
		);
	}

	// no token -> send nothing
	else {
		res.send({});
	}
});

export default router;