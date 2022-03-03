import 'dotenv/config'
import { Router } from 'express';
import request from 'request';
import str from '../constants/strings.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
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
							const dbResponse = await dbMethods.userSignIn(body.registration.id);
							if (dbResponse.message) {
								return res.status(getError.statusCode(dbResponse.message)).send(getError.messageTemplate(dbResponse.message))
							}
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

// so far the only updateable user attribute is username
router.put("/:userid", async (req, res) => {
	// uniqueName returns boolean
    let isUnique = await dbMethods.uniqueName(req.body.username);
    if (isUnique) {
        let updatedUser = await dbMethods.updateUser(req.params.userid, req.body.username);
        if (updatedUser.message) {
            return res.status(getError.statusCode(updatedUser)).send(getError.messageTemplate(updatedUser));
        }
        else if (updatedUser[0] === 0) {
            return res.status(404).end();
        }
        else {
            return res.status(200).end();
        }
    }
    else {
        let err = { message: str.error.type.invalid.unique };
        return res.status(getError.statusCode(err)).send(getError.messageTemplate(err))
    }
});

export default router;