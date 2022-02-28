import { Router } from 'express';
import check from '../controllers/routevalidators.js';
import dbMethods from '../controllers/databaseMethods.js';
import getError from '../controllers/error.js';
const router = Router();

//PAGES API
//Simple API to get one publicly available page to a story
router.get("/:pageid", (req, res) => {
    //check if the page is readable
    check.pageIsReadable(req.params.pageid)
        .then( (result) => {
            //if so, send the page as a json object
            res.json(result);
        }, (err) => {
            //otherwise, if an error occurred, send the appropriate error code
            res.sendStatus(getError.statusCode(err));
        });
});

// create new page
router.post("/create", async (req, res) => {
    let page = await dbMethods.createNewPage({
        title: req.body.title,
        content: req.body.content,
        isStart: req.body.isStart,
        isTBC: req.body.isTBC,
        isEnding: req.body.isEnding,
        isLinked: req.body.isLinked,
        isOrphaned: req.body.isOrphaned,
        contentFinished: req.body.contentFinished,
        AuthorId: req.body.authorId,
        StoryId: req.body.storyid,
    }).catch(function(err) {
        return alert(err.message);
    });
    if(page){
        let children = JSON.parse(req.body.children);
        if (children) {
            for (let i = 0; i < children.length; i++) {
                let toId = 0;
                if (children[i].ToPageId === "blank") {
                    let pagetitle = children[i].linkName;
                    if (pagetitle === "Continue") {
                        pagetitle = "Continue from " + page.title;
                    }
                    let childpage = await dbMethods.createNewPage({
                        AuthorId: req.body.authorId,
                        StoryId: req.body.storyid,
                        title: pagetitle,
                        content: "And then?"
                    });
                    toId = childpage.id;
                }
                else {
                    toId = children[i].ToPageId;
                }
                await dbMethods.createNewLink({
                    linkName: children[i].linkName,
                    AuthorId: req.body.authorId,
                    StoryId: req.body.storyid,
                    FromPageId: page.id,
                    ToPageId: toId
                }).catch((err) => {
                    return alert(err.message);
                });
            }
        }
        return res.status(200).send({storyId: page.StoryId, pageId: page.id, toPageId: toId, authorId: page.AuthorId});
    }
});

// update an existing page
router.put("/update/:pageid", async (req, res) => {
    let pageToUpdate = await check.pageIsWriteable(req.params.pageid, req.body.authorId, req.body.storyid)
    if (pageToUpdate) {
        pageToUpdate.update({
            title: req.body.title,
            content: req.body.content,
            isStart: req.body.isStart,
            isTBC: req.body.isTBC,
            isEnding: req.body.isEnding,
            isLinked: req.body.isLinked,
            isOrphaned: req.body.isOrphaned,
            contentFinished: req.body.contentFinished
        }).catch((err) => {
            return alert(err.message);
        });
        let children = JSON.parse(req.body.children);
        if (children) {
            let childLinks = [];
            for (let i = 0; i < children.length; i++) {
                let toId = 0;
                let pagetitle = children[i].linkName;
                if (pagetitle === "Continue") {
                    pagetitle = "Continue from " + pageToUpdate.title;
                }
                if (children[i].ToPageId === "blank") {
                    let childpage = await dbMethods.createNewPage({
                        AuthorId: req.session.token,
                        StoryId: req.body.storyid,
                        title: pagetitle,
                        content: "And then?"
                    });
                    toId = childpage.id;
                }
                else {
                    toId = children[i].ToPageId;
                }
                let link = await dbMethods.createNewLink({
                    linkName: children[i].linkName,
                    AuthorId: req.session.token,
                    StoryId: req.body.storyid,
                    FromPageId: pageToUpdate.id,
                    ToPageId: toId
                }).catch(function(err){
                    return alert(err.message);
                });
                childLinks.push(link);
            }
            pageToUpdate.setChildLinks(childLinks);
        }
        return res.status(200).send({storyId: pageToUpdate.StoryId, toPageId: childpage.id});
    }
});

// delete an existing page
router.delete("/api/page/delete/:id", async (req, res) => {
    if(check.pageIsWriteable(req.body.pageid, req.session.token, req.body.storyid)) {
        let deletedPage = await dbMethods.deletePage(req.body.pageid).catch( (err) => {
            return res.render(getError.statusCode(err), getError.messageTemplate(err));
        });
        if (deletedPage) {
            return res.sendStatus(200);
        }

    }
});

export default router;