
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
                const result = await client.db(str.db.name.test).collection(str.db.c.users).insertOne({
                    displayName: displayName,
                    oAuthID: oAuthID,
                    viewRestricted: viewRestricted
                });
                console.log(`New user created with the id ${result.insertedId}`)
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
        }
    },
    stories: {
        create: (authorDbId, title, description, warningsObj, tagsIdArr) => {
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
        }
        // publish:
        // delete:
        // getAllPublic:
        // getPublicByAuthor:
        // getByTag
    },
    tags: {
        findOrCreate: (tagName, restrictBool) => {
            connectDB( async () => {
                const result = await client.db(str.db.name.test).collection(str.db.c.tags).findOneAndUpdate({tagName: tagName}, {$setOnInsert: {tagName: tagName, restricted: restrictBool}}, {upsert: true})
                // console.log(result)
                if (result.lastErrorObject.updatedExisting) {
                    console.log(result.value._id)
                }
                else {
                    console.log(result.lastErrorObject.upserted)
                }
            })
        }
    },
    pages: {
        // create:
        // read:
        // update:
        // delete:
    },
    
}
// str.db.c.users
// methods.users.findByName("Jane");

// methods.createUser("Jane", "40b99983-2d70-48ef-b918-f8fa525b8cc2");

// methods.findUserbyAuth("40b99983-2d70-48ef-b918-f8fa525b8cc2");
// methods.findUserbyDBID("629d8e73da60ebfb250442ae");

// methods.stories.create("629d8e73da60ebfb250442ae", "To Delete", "I am created to be deleted." )

// methods.stories.getAllByAuthor("629d8e73da60ebfb250442ae");
// methods.stories.update("62e8b6161db5d0fa0ec6f461", "Hippopotamus", "The River Horse speaks of mud and reeds.")
// methods.tags.findOrCreate("arctic", false)

export default methods;