import { Router } from 'express';
import db from  '../models/index.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
const router = Router();

//TAGS API
//GET ALL TAGS
//Will deliver all existing tags -- including their id, name, and the # of stories that use them - ordered by how many stories use them
// TODO: update this to use db methods file, I think there is already a method created.
router.get("/bycount", (req, res) => {
    db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id group by Tags.id order by num_stories desc;", { type: db.Sequelize.QueryTypes.SELECT }).then( (result) => {
        res.send(result);
    });
});

router.post("/create", async (req, res) => {
    // testRet will be the tag object that matches the search, if one exists.
    // if none exist, it will be null
    let testRet = await dbMethods.tagExists(req.body.tagName).catch( (err) => {
        res.render(getError.statusCode(err), getError.messageTemplate(err));
    });
    if (testRet === null) {
        db.Tag.create({ tagName: req.body.tagName }).then( (result) => {
            // result will be instance of Tag, a tag object
            return res.status(200).send(result);
        }).catch( (err) => {
            res.render(getError.statusCode(err), getError.messageTemplate(err));
        });
    }
    else {
        return res.sendStatus(409);
    }
});

export default router;