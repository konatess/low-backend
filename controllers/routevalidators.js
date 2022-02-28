import db from '../models/index.js';
import str from "../constants/strings.js";

export default {
    // check if id is valid, i.e. is (or can be parsed to) positive, non-zero integer.
    isValidId: (idToTest) => {
        if ((typeof (idToTest) !== "string") && (typeof (idToTest) !== "number")) {
            return false;
        }
        if (idToTest.toString().match(/[\D]/)) {
            return false;
        }
        if (parseInt(idToTest) <= 0) {
            return false;
        }
        return true
    },
    isValidAuth: (authKey) => {
        if (typeof authKey !== "string") {
            return false
        }
        else if (authKey.match(/^[\w]{8}-[\w]{4}-[\w]{4}-[\w]{4}-[\w]{12}$/)) {
            return true
        }
        return false
    },
    storyIsReadable: function (storyId) {
        // The story must 1) exist in the db  2) have the 'isPublic' value set to true
        return new Promise(function (resolve, reject) {
            //check that id is valid
            if (!this.isValidId(storyId)) {
                return reject(new Error(str.error.type.invalid.story));
            }
            // query the database for the story by its id
            db.Story.findOne({ where: { id: parseInt(storyId) } }).then(function (storyResult, err) {
                if (err) {
                    return reject(err);
                }
                else {
                    if (!storyResult) {
                        return reject(new Error(str.error.type.notFound.story));
                    }
                    if (!storyResult.isPublic) {
                        return reject(new Error(str.error.type.notPublic.story));
                    }
                    resolve(storyResult);
                }
            });
        });
    },
    storyIsWriteable: function (storyId, authorId) {
        // checks to see if the current user is signed in and has permissions to write to that story
        return new Promise(function (resolve, reject) {
            if (!this.isValidId(storyId)) {
                return reject(new Error(str.error.type.invalid.story));
            }
            if (!this.isValidId(authorId)) {
                return reject(new Error(str.error.type.invalid.author));
            }
            // query the database for the story by id
            db.Story.findOne({ where: { id: parseInt(storyId) } }).then(function (storyResult, err) {
                if (err) { 
                    return reject(err);
                }
                if (!storyResult) {
                    return reject(new Error(str.error.type.notFound.story));
                }
                // if this particular author did not write it, we are not letting them edit
                if (storyResult.AuthorId !== authorId) {
                    return reject(new Error(str.error.type.denied.story));
                }
                return resolve(storyResult);
            });
        });
    },
    pageIsReadable: function (pageId) {
        // pages are publicly readable if the story they belong to is marked public and they are finished, and not orphaned
        return new Promise(function (resolve, reject) {
            if (!this.isValidId(pageId)) {
                return reject(new Error(str.error.type.invalid.page));
            }
            // look up that page in the db, along with the associated story
            db.Page.findOne({
                where: {
                    id: parseInt(pageId)
                },
                include: [{
                    model: db.Story,
                    as: "Story"
                }]
            }).then(function (pageResult, error) {
                if (error) {
                    return reject(error);
                }
                if (!pageResult) {
                    return reject(new Error(str.error.type.notFound.page));
                }
                if (!pageResult.Story.isPublic) {
                    return reject(new Error(str.error.type.notPublic.story));
                }
                if (pageResult.isOrphaned) {
                    return reject(new Error(str.error.type.notPublic.page.orphan));
                }
                if (!pageResult.contentFinished) {
                    return reject(new Error(str.error.type.notPublic.page.notFinished));
                }
                return resolve(pageResult);
            });
        });
    },
    pageIsWriteable: function (pageId, authorId) {
        // page is writeable if author owns the page
        return new Promise(function (resolve, reject) {
            if (!this.isValidId(authorId)) {
                return reject(new Error(str.error.type.invalid.author));
            }
            if (!this.isValidId(pageId)) {
                return reject(new Error(str.error.type.invalid.page));
            }
            db.Page.findOne({
                where: {
                    id: parseInt(pageId)
                }
            }).then(function (pageResult, error) {
                if (error) {
                    return reject(error);
                }
                if (!pageResult) {
                    return reject(new Error(str.error.type.notFound.page));
                }
                if (pageResult.AuthorId !== authorId) {
                    return reject(new Error(str.error.type.denied.page));
                }
                return resolve(pageResult);
            });
        });
    },
    storyCanBePublished: function(storyId, authorId) {
        // function that checks if a story can be published
        // stories can have orphaned pages, and orphaned pages may be unfinished
        // all non-orphaned pages must pass checks
        // 1) Author must have write privs to the story
        let authorHasWritePrivs = this.storyIsWriteable(storyId, authorId);
        //we want this query to return a story result and not an error
 
        // 2) they have no unlinked pages (pages without outgoing links)
        // NOTE: end/tbc pages don't have outgoing links, and are excluded from check
        let countOfUnlinkedPages = db.Page.count({
            where: {
                isOrphaned: false,
                isLinked: false,
                isEnding: false,
                isTBC: false,
                StoryId: storyId
            } // we want this query to return a count of 0
        });

        // 3) all the content is 'finished' (that are not orphaned)
        var countofUnfinishedPages = db.Page.count({
            where: {
                isOrphaned: false,
                contentFinished: false,
                StoryId: storyId
            }
        });  // we want this query to return a count of 0
        
        // 4) story needs to have a start page
        var hasStartPage = db.Page.count({
            where: {
                isOrphaned: false,
                contentFinished: true,
                isStart: true,
                StoryId: storyId
            }
        });  // we want this query to return a count of 1

        // kick off all these individual tests, and then let us do something after they have completed :)
        return Promise.all([authorHasWritePrivs, countOfUnlinkedPages, countofUnfinishedPages, hasStartPage]);
    }
}