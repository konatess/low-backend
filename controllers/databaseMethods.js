import db from '../models/index.js';
import check from './routevalidators.js';
import str from '../constants/strings.js';
import error from './error.js';

export default {
    userSignIn: async (authKey) => {
        if (!check.isValidAuth(authKey)) {
            return new Error(str.error.type.invalid.auth)
        }
        else {
            const [dbUser, created] = await db.User.findOrCreate({
                where: {
                    oAuthKey: authKey
                },
                defaults: {
                    displayName: "test"
                }
            });
            return { dbUser: dbUser, created: created }
        }
    },
    findUser: (userId) => {
        return db.User.findOne({
            where: {
                id: userId
            }
        }).then((dbUser) => {
            return dbUser;
        });
    },
    checkUsernames: (username) => {
        return db.User.count({
            where: {
                displayName: username
            }
        }).then((count) => {
            return count === 0 ? true : false;
        });
    },
    updateUser: (userid, username) => {
        if (check.isValidId(userid)) {
            return db.User.update({
                displayName:  username
            }, {
                where: {
                    id: parseInt(userid)
                }
            })
        }
        else {
            return error.messageTemplate({message: str.error.type.invalid.auth})
        }
    },
    findAllPublishedUsers: () => {
        return db.User.findAll({
            include: [{
                model: db.Story, as: "Stories",
                where: {
                    "isPublic": true,
                    "isFinished": true
                }
            }],   
        }).then((dbUser) => {
            return dbUser;
        });
    },
    findStory: (storyId) => {
        return db.Story.findOne({
            where: {
                id: storyId
            }
        }).then((dbStory) => {
            return dbStory;
        });
    },
    findAllPublicStories: () => {
        return db.Story.findAll({
            where: {
                isPublic: true,
                isFinished: true
            },
            include: [{
                model: db.User,
                as: "Author"
            }],
            order: [["title", "ASC"]]
        }).then((stories) => {
            return stories;
        });
    },
    findAllTagsAndStoriesCount: () => {
        return db.Tag.findAll({
            group: ["Tag.id"],
            includeIgnoreAttributes: false,
            include: [{
                model: db.Story,
                where: {
                    isPublic: true,
                    isFinished: true
                }
            }],
            attributes: [
                "id",
                "TagName",
                [db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "num_stories"],
            ],
            order: [[db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "DESC"]]
        }).then( (result) => {
            return result;
        });
    },
    findTaggedStories: (tagId) => {
        return db.Tag.findOne({
            where: {
                id: tagId
            },
            include: [{
                model: db.Story,
                where: {
                    isPublic: true,
                    isFinished: true
                },
                include: [{
                    model: db.User, as: "Author"
                }]
            }]
        }).then( (result) => {
            return result;
        });
    },
    findAllTagsAndStoriesCount: () => {
    return db.Tag.findAll({
        group: ["Tag.id"],
        includeIgnoreAttributes: false,
        include: [{
            model: db.Story,
            where: {
                isPublic: true,
                isFinished: true
            }
        }],
        attributes: [
            "id",
            "TagName",
            [db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "num_stories"],
        ],
        order: [[db.sequelize.fn("COUNT", db.sequelize.col("Stories.id")), "DESC"]]
    }).then( (result) => {
        return result;
    });
},
    findAllAuthorStories: (userId) => {
        return db.Story.findAll({
            where: {
                AuthorId: userId
            },
            order: [["title", "ASC"]]
        }).then((dbStories) => {
            return dbStories;
        });
    },
    findRecentAuthorStories: (userId) => {
        return db.Story.findAll({
            where: {
                AuthorId: userId
            },
            limit: 3,
            order: [
                ["updatedAt", "DESC"]
            ]
        }).then( (dbStory) => {
            return dbStory;
        });
    },
    publishStory: (storyId, authorId) => {
        //Helper function that will first check if a story can be published,
        //then attempt to update it in the db
        return new Promise((resolve, reject) => {
            //do the async thing
            check.storyCanBePublished(storyId, authorId).then(
                (testResults) => {
                    //let's see what we got back from the test results, and return info 
                    //about succeeded (or failed)
                    //we SUCCEEDED if the story we asked for is writeable and it doesn't have any invalid pages
                    if (testResults[0].id === parseInt(storyId) && testResults[1] === 0 && testResults[2] === 0 && testResults[3]===1) {
                        //attempt to actually update the story now
                        db.Story.update({ isPublic: true, isFinished: true }, { where: { id: testResults[0].id } }).then((updateResults) => {
                            if (updateResults) { //if the update worked, we'll resolve with a success!
                                return resolve({ success: true });
                            }
                            else { //otherwise if there was some kind of error, reject with an error
                                return reject(new Error("Generic Error"));
                            }
                        },
                        (err) => { //if there was a db error, reject with an error
                            return reject(err);
                        }
                        );
                    }
                    else {
                        //otherwise, see what broke and return the appropriate info via an error
                        //note: we are not rejecting these exactly, we are resolving with info about what the user needs to correct (because there could be multiple issues to address)
                        var errorObj = {
                            success: false,
                            errors: []
                        };
                        if (testResults[1] > 0) {
                            errorObj.errors.push("Unlinked pages");
                        }
                        if (testResults[2] > 0) {
                            errorObj.errors.push("Unfinished pages");
                        }
                        if (testResults[3] !== 1) {
                            errorObj.errors.push("No start page");
                        }
                        return resolve(errorObj); //note: we are RESOLVING this because we do actually want the front-end to get feedback
                    }
    
                },
                (err) => {
                    //or if our publish tests failed, then we just return that error
                    return reject(err);
                }
            );
        });
    },
    //function to UNPUBLISH a story from the db
    //only requires that the owner has write access
    unpublishStory: (storyId, authorId) => {
        return new Promise((resolve, reject) => {
            check.storyIsWriteable(storyId, authorId).then(
                (storyResult) => {
                    //if the story is writeable we'll go ahead and try to update it
                    db.Story.update({ isPublic: false, isFinished: false }, { where: { id: storyResult.id } }).then(
                        (updateResult) => {
                            return resolve({ success: true }); //hooray, we succeeded!
                        });
                },
                (err) => {
                    return reject(err); //otherwise, we did not succeed
                }
            );
        });
    },
    tagExists: (tagName) => {
        var lowercase = tagName.toLowerCase();
        return db.Tag.findOne({
            where: {
                tagName: db.sequelize.where(db.sequelize.fn("LOWER", db.sequelize.col("tagName")), lowercase)
            }
        }).then((result) => {
            return result;
        });
    },
    allTags: () => {
        const dbTags = db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id group by Tags.id order by num_stories desc;",
            { type: db.Sequelize.QueryTypes.SELECT });
        return dbTags;
    },
    findStoryTags: (storyId) => {
        return db.Tag.findAll({
            include: [{
                model: db.Story,
                attributes: [],
                where: {
                    id: storyId
                }
            }],
            attributes: ["id", "tagName"]
        }).then((result) => {
            return result;
        });
    },
    topFiveTags: () => {
        const dbTags = db.sequelize.query("select Tags.id, Tags.TagName, COUNT(Stories.id) as num_stories from Tags left join StoryTag on StoryTag.TagId = Tags.id left join Stories on StoryTag.StoryId = Stories.id where Stories.isPublic = 1 and Stories.isFinished = 1 group by Tags.id order by num_stories desc limit 5;",
            { type: db.Sequelize.QueryTypes.SELECT });
        return dbTags;
    },
    findFirstPage: (authorId, storyId) => {
        return db.Page.findOne({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                isStart: true
            }
        }).then((dbFirstPage) => {
            return dbFirstPage;
        });
    },
    findAllPagesInStory: (authorId, storyId) => {
        return db.Page.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId
            },
            attributes: ["id", "title"],
            order: [["isOrphaned", "DESC"]]
        }).then((allPages) => {
            return allPages;
        });
    },
    findPageParent: (authorId, storyId, toPageId) => {
        return db.Link.findAll({
            where: {
                AuthorId: authorId,
                StoryId: storyId,
                ToPageId: toPageId
            }
        }).then((dbLinks) => {
            return dbLinks;
        });
    },
    createNewPage: (pageObj) => {
        return db.Page.create(pageObj).then((newPage) => {
            return newPage;
        });
    },
    createMultiplePages: (pageObjArray) => {
        return db.Page.bulkCreate(pageObjArray).then((newPages) => {
            var newPagesId = [];
            for (var i = 0; i < newPages.length; i++) {
                var id = newPages[i].id;
                newPagesId.push(id);
            }
            return newPagesId;
        });
    },
    updatePage: (pageObj, pageid) => {
        return db.Page.update({
            title: pageObj.title,
            content: pageObj.content,
            isStart: pageObj.isStart,
            isTBC: pageObj.isTBC,
            isEnding: pageObj.isEnding,
            isLinked: pageObj.isLinked,
            isOrphaned: pageObj.isOrphaned,
            contentFinished: pageObj.contentFinished
        }, {
                where: {
                    id: pageid
                }
            });
    },
    deletePage: (pageid) => {
        return db.Page.destroy({
            where: {
                id: pageid
            }
        });
    },
    createNewLink: (linkObj) => {
        return db.Link.create(linkObj).then((newLink) => {
            return newLink;
        });
    },
    createMultipleLinks: (linkObjArray) => {
        return db.Link.bulkCreate(linkObjArray).then((newLinks) => {
            return newLinks;
        });
    }
}