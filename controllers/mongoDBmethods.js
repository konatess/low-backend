
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
                authorDbId: authorDbId,
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
                const result = await client.db(str.db.name.test).collection(str.db.c.stories).find({authorDbId: authorDbId}, {sort: {updated: 1}}).toArray();
                console.log(result);
            })
        }
    },
    tags: {},
    pages: {},
    
}
// str.db.c.users
// methods.users.findByName("Jane");

// methods.createUser("Jane", "40b99983-2d70-48ef-b918-f8fa525b8cc2");

// methods.findUserbyAuth("40b99983-2d70-48ef-b918-f8fa525b8cc2");
// methods.findUserbyDBID("629d8e73da60ebfb250442ae");

// methods.stories.create(ObjectId("629d8e73da60ebfb250442ae"), "Magical Felines", "Jiji and Moony are silly cats." )

// methods.stories.getAllByAuthor(ObjectId("629d8e73da60ebfb250442ae"));

export default methods;