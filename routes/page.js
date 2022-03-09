import { Router } from 'express';
import check from '../controllers/routevalidators.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
const router = Router();

//PAGES API
//get one publicly available page to a story
router.get("/:pageid", async (req, res) => {
    let page = await dbMethods.findPageById(req.params.pageid)
    if (page.message) {
        res.status(getError.statusCode(page)).send(getError.messageTemplate(page)).end();
    }
    else {
        res.send(story)
    }
});

// new page
router.post("/create", async (req, res) => {
    let childLinksArr = [];
    // this returns either an error object with a message, or the page object
    let page = await dbMethods.createNewPage({
        title: req.body.title,
        content: req.body.content,
        isStart: req.body.isStart,
        isTBC: req.body.isTBC,
        isEnding: req.body.isEnding,
        isLinked: req.body.children.length || false,
        isOrphaned: req.body.isOrphaned,
        contentFinished: req.body.contentFinished,
        AuthorId: req.body.authorId,
        StoryId: req.body.storyId,
    })
    // page will have .message if it's actually an error object, but not if it's a page object
    if (page.message) {
        return res.status(getError.statusCode(page)).send(getError.messageTemplate(page))
    }
    // check if page was given child page links before saving
    if (req.body.children.length) {
        for (let i = 0; i < req.body.children.length; i++) {
            let toId = 0;
            if (req.body.children[i].ToPageId === "blank") {
                let childTitle = req.body.children[i].linkName === "Continue" ? "Continue from " + page.title : req.body.children[i].linkName;
                let childPage = await dbMethods.createNewPage({
                    AuthorId: req.body.authorId,
                    StoryId: req.body.storyId,
                    title: childTitle,
                    content: "And then?",
                    contentFinished: false
                });
                // checking for error, same as initial page creation
                if (childPage.message) {
                    return res.status(getError.statusCode(childPage)).send(getError.messageTemplate(childPage))
                }
                toId = childPage.id;
            }
            else {
                toId = req.body.children[i].ToPageId;
            }
            // same as page, link will return either error object with message, or link object
            let newLink = await dbMethods.createNewLink({
                linkName: req.body.children[i].linkName,
                AuthorId: req.body.authorId,
                StoryId: req.body.storyId,
                FromPageId: page.id,
                ToPageId: toId
            })
            // handle error
            if (newLink.message) {
                return res.status(getError.statusCode(newLink)).send(getError.messageTemplate(newLink))
            }
            // gather childLinks to pass to the front end
            // if multiple pages were created, user can choose what to work on next.
            childLinksArr.push(newLink);
        }
    }
    return res.status(200).send({storyId: page.StoryId, pageId: page.id, authorId: page.AuthorId, childLinks: childLinksArr});
})

// update an existing page
router.put("/update/:pageid", async (req, res) => {
    let childLinksArr = [];
    // this returns either an error object with a message, or the page object
    // db method includes some error handling
    let page = await dbMethods.updatePage({
        title: req.body.title,
        content: req.body.content,
        isStart: req.body.isStart,
        isTBC: req.body.isTBC,
        isEnding: req.body.isEnding,
        isLinked: req.body.isLinked,
        isOrphaned: req.body.isOrphaned,
        contentFinished: req.body.contentFinished
    });
    // check for errors and return if needed
    if (page.message) {
        return res.status(getError.statusCode(page)).send(getError.messageTemplate(page))
    }
    // were new child pages added during editing? We'll create them here.
    if (req.body.children.length) {
        for (let i = 0; i < req.body.children.length; i++) {
            let toId = 0;
            if (req.body.children[i].ToPageId === "blank") {
                let childTitle = req.body.children[i].linkName === "Continue" ? "Continue from " + page.title : req.body.children[i].linkName;
                let childPage = await dbMethods.createNewPage({
                    AuthorId: req.body.authorId,
                    StoryId: req.body.storyId,
                    title: childTitle,
                    content: "And then?",
                    contentFinished: false
                });
                // checking for error, same as initial page creation
                if (childPage.message) {
                    return res.status(getError.statusCode(childPage)).send(getError.messageTemplate(childPage))
                }
                toId = childPage.id;
            }
            else {
                toId = req.body.children[i].ToPageId;
            }
            // same as page, link will return either error object with message, or link object
            let newLink = await dbMethods.createNewLink({
                linkName: req.body.children[i].linkName,
                AuthorId: req.body.authorId,
                StoryId: req.body.storyId,
                FromPageId: page.id,
                ToPageId: toId
            })
            // handle error
            if (newLink.message) {
                return res.status(getError.statusCode(newLink)).send(getError.messageTemplate(newLink))
            }
            // gather childLinks to pass to the front end
            // if multiple pages were created, user can choose what to work on next.
            childLinksArr.push(newLink);
        }
    }
    return res.status(200).send({storyId: page.StoryId, pageId: page.id, authorId: page.AuthorId, childLinks: childLinksArr});
});

// delete an existing page
// TODO: update db method and move check method call to db method
router.delete("/delete/:pageid", async (req, res) => {
    if(check.pageIsWriteable(req.params.pageid, req.session.token, req.body.storyid)) {
        let deletedPage = await dbMethods.deletePage(req.params.pageid).catch( (err) => {
            return res.render(getError.statusCode(err), getError.messageTemplate(err));
        });
        if (deletedPage) {
            return res.sendStatus(200);
        }

    }
});

export default router;