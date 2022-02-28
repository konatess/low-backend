import { Router } from 'express';
import db from  '../models/index.js';
import check from '../controllers/routevalidators.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
const router = Router();

// Story routes get story info
router.get("/:storyid", async (req, res) => {
    // get story details of one story
    let story = await dbMethods.findStory(req.params.storyid);
    if (story.message) {
        res.status(getError.statusCode(story)).send(getError.messageTemplate(story)).end();
    }
    else {
        res.send(story)
    }
});

// get all the pages in a story, for author only
router.get("/:storyid/allpages", (req, res) => {
    check.storyIsWriteable(req.params.storyid, req.session.token)
    .then((result) => {
        dbMethods.findAllPagesInStory(result.AuthorId, result.id).then((pages) => {
            res.json(pages);
        });
    });
});

router.post("/create", async (req, res) => {
    // if (!req.session.token) {
    //     let err = { message: str.error.type.noLogin }
    //     return res.render(getError.statusCode(err), getError.messageTemplate(err));
    // }
    let theStory = await db.Story.create({
        title: req.body.title,
        description: req.body.description,
        chooseNotToWarn: req.body.chooseNotToWarn,
        violence: req.body.violence,
        nsfw: req.body.nsfw,
        nonConsent: req.body.nonConsent,
        characterDeath: req.body.characterDeath,
        profanity: req.body.profanity,
        isPublic: req.body.isPublic,
        isFinished: req.body.isFinished,
        doneByDefault: req.body.doneByDefault,
        AuthorId: req.body.authorId
    }).catch( (err) => {
        return res.status(err).send(getError.messageTemplate(err));
    });
    if (req.body.tags) {
        let tagsArr = req.body.tags.split(",");
        theStory.setTags(tagsArr, { where: { StoryId: theStory.id } }).catch( (err) => {
            return res.status(err).send(getError.messageTemplate(err));
        });
    }
    return res.status(200).send({ id: theStory.id });
});


//PUT METHOD - PUBLISH STORY
//We only call this when we want to validate and publish a story 
// TO DO: - make an UNPUBLISH route for revoking public access to your story
router.put("/publish", (req, res) => {
    // if (!req.session.token) {
    //     let err = { message: "Not Logged In" }
    //     return res.render(getError.statusCode(err), getError.messageTemplate(err));
    // }
    let toPublish = req.body.isPublic;
    if(toPublish==="true") {
        dbMethods.publishStory(req.body.storyId, req.body.authorId).then((publishingResult) => {
        //send info about the result back to the front end
        //NOTE: this will either be a success, or a failure 
        //front end gets to decide what to do with it
            return res.json(publishingResult); 
        }, (err) => { //trap outright rejections for malformed urls, etc
            res.sendStatus(getError.statusCode(err));
        });
    }
    else if (toPublish==="false") {
        dbMethods.unpublishStory(req.body.storyId, req.body.authorId).then(
            (unpublishingResult) => {
                return res.json(unpublishingResult);
            },
            (err) => {
                res.sendStatus(getError.statusCode(err));
            }
        );
    }
    else {
        res.sendStatus(400);
    }
});

// update story info route
router.put("/update/:storyid", async (req, res) => {
    let theStory = await check.storyIsWriteable(req.params.storyid, req.body.authorId).catch( (err) => {
        return alert(err.message);
    });
    if (theStory) {
        // set this variable in case we need/want to use it in future.
        // this could also be done with a .then.
        let numRows = await db.Story.update({
            title: req.body.title,
            chooseNotToWarn: req.body.chooseNotToWarn,
            violence: req.body.violence,
            nsfw: req.body.nsfw,
            nonConsent: req.body.nsfw,
            characterDeath: req.body.characterDeath,
            profanity: req.body.profanity,
            isPublic: req.body.isPublic,
            isFinished: req.body.isFinished,
            doneByDefault: req.body.doneByDefault
        }, {
            where: { id: req.params.id }
        });
        if (req.body.tags) {
            let tagsArr = req.body.tags.split(",");
            theStory.setTags(tagsArr, { where: { StoryId: req.params.id } }).then( (dbTag) => {
                if (dbTag === 0) {
                    return res.status(404).end();
                }
                else {
                    return res.status(200).end();
                }
            });
        }
    }
});

// delete a story and all it's pages and links
router.delete("/:storyid", async (req, res) => {
    // This needs error handling
    // may make more sense to move some of this to db methods file
    let theStory = await check.storyIsWriteable(req.params.id, req.body.authorId);
    let numLinks = await db.Link.destroy({where: {StoryId: req.params.storyid}});
    let numPages = await db.Page.destroy({where: {StoryId: req.params.storyid}});
    await theStory.destroy();
    return res.sendStatus(200).send(numLinks, numPages);
});

export default router;