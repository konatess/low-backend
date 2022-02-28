import { Router } from 'express';
import db from  '../models/index.js';
import check from '../controllers/routevalidators.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
const router = Router();

// TODO: create findOrCreate route
router.get("/find", (req, res) => {
    dbMethods.userSignIn(req.params.authKey)
    .then( (response) => {
        res.json(response);
    })
    .catch( err => res.json(err))
});

// update this to use db methods file
router.get("/:username", (req, res) => {
    db.User.findAll({
        where: {
            displayName: req.params.username
        }
    }).then( (dbUser) => {
        res.json(dbUser);
    });
});

// update this to use db methods file
router.put("/:userid", (req, res) => {
    check.isValidId(req.body.userid)
    db.User.update({
        displayName: req.body.username
    }, {
        where: {
            id: req.params.userid
        }
    }).then( (dbUser) => {
        if (dbUser === 0) {
            return res.status(404).end();
        }
        else {
            return res.status(200).end();
        }
    });
});

export default router;