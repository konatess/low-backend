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
    storyIsReadable: (storyObj) => {
        if (!storyObj) {
            return { message: str.error.type.notFound.story }
        }
        else if (!storyObj.isPublic) {
            return { message: str.error.type.notPublic.story }
        }
        else {
            return storyObj
        }
    },
    storyIsWriteable: (authorId, storyObj) => {
        if (!storyObj) {
            return { message: str.error.type.notFound.story }
        }
        else if (storyObj.AuthorId && storyObj.AuthorId !== authorId) {
            return { message: str.error.type.denied.story }
        }
        return storyObj
    },
    pageIsReadable: (pageObj) => {
        if (!pageObj) {
            return { message: str.error.type.notFound.page }
        }
        if (!pageObj.Story.isPublic) {
            return { message: str.error.type.notPublic.story }
        }
        if (pageObj.isOrphaned) {
            return { message: str.error.type.notPublic.page.orphan }
        }
        if (!pageObj.contentFinished) {
            return { message: str.error.type.notPublic.page.notFinished }
        }
        return pageObj
    },
    pageIsWriteable: (authorId, pageObj) => {
        if (!pageObj) {
            return { message: str.error.type.notFound.page }
        }
        else if (pageObj.AuthorId && pageObj.AuthorId !== authorId) {
            return { message: str.error.type.denied.page }
        }
        return pageObj
    },
    storyCanBePublished: ( writeable, numUnlinked, numOrphaned, numStart ) => {
        return writeable && numUnlinked === 0 && numOrphaned === 0 && numStart === 1
    },
    oldstoryCanBePublished: function(storyId, authorId) {
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