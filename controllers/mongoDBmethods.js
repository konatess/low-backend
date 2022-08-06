
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import checkRoute from './routevalidators.js';
import checkDb from './dbvalidators.js';
import str from "../constants/strings.js";
const uri = process.env.DBURI.replace("<username>", process.env.DBADMIN).replace("<password>", process.env.DBADMINPW);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// object with database methods

// main (connection) as separate function, called in to each method prn

// put db and collection names in strings? .env?

async function connectDB(callback) {
    try {
        await client.connect();

        await callback();
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

const methods = {
    users: {
        create: (displayName, oAuthID, viewRestricted = false) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.users).findOneAndUpdate({displayName: displayName,}, {$setOnInsert: {
                    displayName: displayName,
                    oAuthID: oAuthID,
                    viewRestricted: viewRestricted
                }}, {upsert: true});
                if (result.lastErrorObject.updatedExisting) {
                    console.log("This name is already taken")
                }
                else {
                    console.log(`User was created with database ID: ${result.lastErrorObject.upserted}`)
                }
            })
        },
        findByName: (displayName) => {
            let result;
            connectDB( async () => {
                 result = await client.db(str.db.name.test).collection(str.db.c.users).findOne({displayName: displayName});
            
                if (result) {
                    console.log(`Found user named ${displayName}:`);
                    console.log(result)
                } else {
                    console.log(`No users found named ${displayName}`);
                }
            })
            return result
        },
        findByAuth: (oAuthID) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.users).findOne({oAuthID: oAuthID});
                if (result) {
                    console.log(`Found user with AuthID ${oAuthID}:`);
                    console.log(result)
                } else {
                    console.log(`No users found with AuthID ${oAuthID}`);
                }
            })
        },
        findByDbId: (databaseID) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.users).findOne(ObjectId(databaseID));
                if (result) {
                    console.log(`Found user with databaseID ${databaseID}:`);
                    console.log(result)
                } else {
                    console.log(`No users found with databaseID ${databaseID}`);
                }
            })
        },
        // update:
        // delete:
    },
    stories: {
        create: (authorDbId, title, description, warningsObj, tagsIdArr) => {
            // TODO: create start page when creating story?
            let newStory = {
                title: title,
                description: description,
                authorDbId: ObjectId(authorDbId),
                isPublic: false,
                warnings: warningsObj,
                tags: tagsIdArr,
                updated: Date.now()
            }
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).insertOne(newStory);
                console.log(`New story created with the id ${result.insertedId}`)
            })
        },
        getAllByAuthor: (authorDbId) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).find({authorDbId: ObjectId(authorDbId)}, {sort: {updated: -1}}).toArray();
                if (!result.length) {
                    console.log('No stories found by this author')
                }
                else {
                    console.log(result);
                }
            })
        },
        update: (storyId, title, description, warningsObj, tagsIdArr) => {
            let updateObj = {
                title: title,
                description: description,
                warnings: warningsObj,
                tags: tagsIdArr,
                updated: Date.now()
            }
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).updateOne({_id: ObjectId(storyId)}, {$set: updateObj} )
                console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`)
            })
        },
        getById: (storyId) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).findOne(ObjectId(storyId));
                if (result) {
                    console.log(`Found story with _id ${storyId}:`);
                    console.log(result)
                } else {
                    console.log(`No stories found with _id ${storyId}`);
                }
            })
        }
        // publish:
        // deleteById:
        // getAllPublic:
        // getPublicByAuthor:
        // getPublicByTag:
    },
    tags: {
        findOrCreate: (tagName, restrictBool) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.tags).findOneAndUpdate({tagName: tagName}, {$setOnInsert: {tagName: tagName, restricted: restrictBool}}, {upsert: true})
                if (result.lastErrorObject.updatedExisting) {
                    console.log(result.value._id)
                }
                else {
                    console.log(result.lastErrorObject.upserted)
                }
            })
        },
        getAll: () => {
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.tags).find({}, {sort: {tagName: 1}}).toArray();
                if (!result.length) {
                    console.log('No tags found')
                }
                else {
                    console.log(result);
                }
            })
        },
        getUnrestricted: () => {
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.tags).find({restricted: false}, {sort: {tagName: 1}}).toArray();
                if (!result.length) {
                    console.log('No tags found')
                }
                else {
                    console.log(result);
                }
            })
        },
        getAllInUse: () => {
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).aggregate([
                    {
                        $lookup: {
                            from: str.db.c.tags,
                            localField: "tags",
                            foreignField: "_id",
                            as: "allTagsInUse"
                        }
                    },
                    { $unwind: "$allTagsInUse" },
                    { $replaceRoot: { newRoot: "$allTagsInUse" } },
                    { $sort: {tagName: 1}}
                  ]).toArray();
                if (!result.length) {
                    console.log('No tags in use')
                }
                else {
                    console.log(result);
                }
            })
        },
        getUnrestrictedInUse: () => {
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).aggregate([
                    {
                      $lookup: {
                        from: str.db.c.tags,
                        localField: "tags",
                        foreignField: "_id",
                        as: "unrestrictedInUse"
                      }
                    },
                    { $unwind: "$unrestrictedInUse" },
                    { $replaceRoot: {newRoot: "$unrestrictedInUse"} },
                    { $match: {restricted: false} },
                    { $sort: {tagName: 1}}
                  ]).toArray();
                if (!result.length) {
                    console.log('No tags in use')
                }
                else {
                    console.log(result);
                }
            })
        },
        delete: (id) => {
            connectDB( async () => {
                const inUse = await client.db(str.db.name.test).collection(str.db.c.stories).findOne({tags: ObjectId(id)});
                if (inUse) {
                    console.log("This tag is in use.")
                }
                else {
                    console.log(`Tag ${id} can be deleted.`)
                    const status = await client.db(str.db.name.test).collection(str.db.c.tags).deleteOne({_id: ObjectId(id)})
                    console.log(status)
                }
            })
        }
    },
    pages: {
        create: (storyId, title, content, contentFinished, isStart, isTBC, isEnding, isOrphaned, childArr) => {
            let childPages = childArr.length ? childArr.map(child => {return ObjectId(child)}) : childArr
            let page = {
                storyId: ObjectId(storyId),
                title: title,
                content: content,
                contentFinished: contentFinished,
                isStart: isStart,
                isTBC: isTBC,
                isEnding: isEnding,
                isOrphaned: isOrphaned,
                updated: Date.now(),
                childPages: childPages
            }
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.pages).insertOne(page)
                console.log(`New page created with the id ${result.insertedId}`)
            })
        },
        getById: (pageId) => {
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.pages).findOne(ObjectId(pageId))
                if (result) {
                    console.log(`Found page with pageId ${pageId}:`);
                    console.log(result)
                } else {
                    console.log(`No pages found with pageId ${pageId}`);
                }
            })
        },
        update: (pageId, title, content, contentFinished, isStart, isTBC, isEnding, isOrphaned, childArr) => {
            let childPages = childArr.length ? childArr.map(child => {return ObjectId(child)}) : childArr
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.pages).findOneAndUpdate({_id: ObjectId(pageId)}, {$set: {
                    title: title,
                    content: content,
                    contentFinished: contentFinished,
                    isStart: isStart,
                    isTBC: isTBC,
                    isEnding: isEnding,
                    isOrphaned: isOrphaned,
                    updated: Date.now(),
                    childPages: childPages
                }})
                if (result.lastErrorObject.updatedExisting) {
                    console.log(result.value._id)
                }
                else {
                    console.log(result)
                }
            })
        },
        // delete:
        // deleteCleanUp: (check children of deleted page and update orphan status, check for parent pages and remove deleted page from childPages)
        deleteCleanUp: (pageId, childArr) => {
            connectDB( async () => {
                // remove id from parent page childPages arrays
                // const resultParents = await client.db(str.db.name.test).collection(str.db.c.pages).updateMany({childPages: ObjectId(pageId)}, {$pull: {childPages: ObjectId(pageId)}})
                // console.log(`${resultParents.matchedCount} parent page(s) matched the filter, updated ${resultParents.modifiedCount} page(s)`);
                if (childArr.length) {
                    // find all child pages with no other parents
                        // take each childId
                        // find at least one parent (not the deleted page, this should be a previous step.)
                        // if no parent page, update isOrphan to true for that child
                    let childIds = childArr.map(child => { return ObjectId(child)})
                    const nonOrphans = await client.db(str.db.name.test).collection(str.db.c.pages).aggregate([
                        { $match: {childPages: {$in: childIds}} },
                        { $project: {childPages: 
                            { $filter: {
                                input: "$childPages",
                                as: "child",
                                cond: {$setIsSubset: [["$$child"], childIds]}
                            } },
                            _id:0
                        } },
                        { $unwind: { path: "$childPages" } },
                        { $group: {_id: "$childPages"} }
                    ]).toArray()
                    console.log(nonOrphans)
                    let orphans = childIds.filter(childId => {
                        let child = {_id: childId}
                        console.log(child)
                        return nonOrphans.includes(child)
                    })
                    console.log(orphans)
                }
                else {
                    console.log("No children")
                }
                // const resultChild = await client.db(str.db.name.test).collection(str.db.c.pages).updateOne({_d: childId}, {$set: {isOrphan: true}})
            })
        }
        // createBranch: (batch create children)
    },
    links: {
        create: (linksArr) => {
            for (let i = 0; i < linksArr.length; i++) {
                linksArr[i].fromPageId = ObjectId(linksArr[i].fromPageId);
                linksArr[i].toPageId = ObjectId(linksArr[i].toPageId);
            }
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.links).insertMany(linksArr)
                console.log(`${result.insertedCount} links were inserted`)
                console.log(result.insertedIds)
            })
        },
        getByParent: (parentPageId) => {
            let parent = ObjectId(parentPageId);
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.links).find({fromPageId: parent}).toArray();
                console.log(result)
            })
        },
        getByChild: (childPageId) => {
            let child = ObjectId(childPageId);
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.links).find({toPageId: child}).toArray();
                console.log(result)
            })
        },
        updateById: (linkObj) => {
            linkObj._id = ObjectId(linkObj._id);
            linkObj.fromPageId = ObjectId(linkObj.fromPageId)
            linkObj.toPageId = ObjectId(linkObj.toPageId)
            connectDB(async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.links).updateOne({_id: linkObj._id}, {$set: linkObj});
                console.log(`${result.matchedCount} links matched the search, ${result.modifiedCount} links were updated`)
            })
        },
        deleteById: (linkId) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.links).deleteOne({_id: ObjectId(linkId)})
                if (result.deletedCount === 1) {
                    console.log("Successfully deleted the link.");
                  } else {
                    console.log("No links matched the query. Deleted 0 links.");
                  }
            })
        }
    }
}
// str.db.c.users
// methods.users.findByName("Jane");

// methods.users.create("Jane", "40b99983-2d70-48ef-b918-f8fa525b8cc2");
// methods.users.create("Delete Me", "112ac3fb-f458-4b06-90e3-737ea96d545b");

// methods.findUserbyAuth("40b99983-2d70-48ef-b918-f8fa525b8cc2");
// methods.findUserbyDBID("629d8e73da60ebfb250442ae");

// methods.stories.create("629d8e73da60ebfb250442ae", "To Delete", "I am created to be deleted." )

// methods.stories.getAllByAuthor("629d8e73da60ebfb250442ae");
// methods.stories.update("62e8b6161db5d0fa0ec6f461", "Hippopotamus", "The River Horse speaks of mud and reeds.", null, [ObjectId("62e8c63d87ae97aeba50efbb"), ObjectId("62ea4743b61bc35177c13671"), ObjectId("62ea475ab61bc35177c17c7b")])
// methods.stories.update("62e776c7895f939880b6eda9", "Magical Felines", "Jiji and Moony are silly cats.", null, [ObjectId("62ea46f9b61bc35177c045c3"), ObjectId("62ea4735b61bc35177c106e2")])
// methods.tags.findOrCreate("deletable", false)
// methods.stories.getById("62e8b6161db5d0fa0ec6f461")

// methods.tags.getAll()
// methods.tags.getUnrestricted()
// methods.tags.getAllInUse()
// methods.tags.getUnrestrictedInUse()
// methods.tags.delete("62ea4fc5b61bc35177d9402d")
// methods.pages.create("62e8b6161db5d0fa0ec6f461", "Start", "I, the River Horse sing of mud and reeds, of the great river waters and soft banks.", true, true, true, false, false, [])
// methods.pages.create("62e8b6161db5d0fa0ec6f461", "Random Branch", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu.", false, false, true, false, false, [])
// methods.pages.getById("62eb7e83bae5685266c8cfac")
// methods.pages.update("62ecc8d7ace3b424b3754579", "Continue from Start", "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibu.", false, false, true, false, false, ["62ecc8eaef27ab16ec76a5a6", "62ece9573090ccf54dca01cf"])
// methods.pages.deleteCleanUp("62ecc8d7ace3b424b3754579", ["62eb7e83bae5685266c8cfac", "62ece9573090ccf54dca01cf"])
// methods.links.create([{fromPageId: "62eb7e83bae5685266c8cfac", toPageId: "62eb827009777fdc7bc9b6b3", linkName: "Continue"},{fromPageId: "62eb827009777fdc7bc9b6b3", toPageId: "62ecc8d7ace3b424b3754579", linkName: "Continue"} ])
// methods.links.getByParent("62eb7e83bae5685266c8cfac")
// methods.links.getByChild("62ecc8d7ace3b424b3754579")
// methods.links.updateById({ _id: "62ee16bfacdf0f5a927f8255", fromPageId: "62ecc8d7ace3b424b3754579", toPageId: "62ece9573090ccf54dca01cf", linkName: 'Continue'})
// methods.links.deleteById("62ee159aafb5d7db41a9e943")


export default methods;