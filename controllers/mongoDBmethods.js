
import 'dotenv/config'
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';
import strings from '../constants/strings';
const uri = process.env.DBURI.replace("<username>", process.env.DBADMIN).replace("<password>", process.env.DBADMINPW);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const connectM = async (database, callback) => {
    try {
        await mongoose.connect(uri.replace("<database>", database));
        await(callback);
    } catch (error) {
        console.log(error);
    } finally {
        await mongoose.disconnect();
    }

}

connectM("low-test001").catch((error) => console.error(error));

const methodsM = {
    users: {
        
    },
    stories: {},
    tags: {},
    pages: {},
}


const tableNames = {
    usersTable: "users001",
}

async function main(callback, data, options) {
    try {
        await client.connect();

        await callback(client, data, options);
    } catch (error) {
        console.error(error);
    } finally {
        await client.close();
    }
}

async function listDBs(client) {
    const databasesList = await client.db().admin().listDatabases();

    // console.log(databasesList);
    databasesList.databases.forEach(db => {
        console.log(`-${db.name}`);
    });
} 

async function createUser(client, userObj) {
    const result = await client.db("low-test001").collection("users001").insertOne(userObj);

    console.log(`New user created with the id ${result.insertedId}`)
}

async function findUserbyName(client, username) {
    const result = await client.db("low-test001").collection("users001").findOne({username: username});

    if (result) {
        console.log(`Found one user named ${username}:`);
        console.log(result)
    } else {
        console.log(`No users found named ${username}`);
    }
}

async function updateUserbyName (client, data) {
    const result = await client.db("low-test001").collection("users001").updateOne({username: data.username}, {$set: data.updated});
    console.log(`${result.matchedCount} users found`);
    console.log(`${result.modifiedCount} users updated`);
}


// object with database methods

// main (connection) as separate function, called in to each method prn

// put db and collection names in strings? .env?

// async function connectDB(callback) {
//     try {
//         await client.connect();

//         await callback();
//     } catch (error) {
//         console.error(error);
//     } finally {
//         await client.close();
//     }
// }

const methods = {
    createUser: (displayName, oAuthID, viewRestricted = false) => {
        connectDB( async () => {
            const result = await client.db("low-test001").collection("users001").insertOne({
                displayName: displayName,
                oAuthID: oAuthID,
                viewRestricted: viewRestricted
            });
            console.log(`New user created with the id ${result.insertedId}`)
        })
    },
    findUserbyName: (displayName) => {
        connectDB( async () => {
            const result = await client.db("low-test001").collection("users001").findOne({displayName: displayName});
        
            if (result) {
                console.log(`Found user named ${displayName}:`);
                console.log(result)
            } else {
                console.log(`No users found named ${displayName}`);
            }
        })
    },
    findUserbyAuth: (oAuthID) => {
        connectDB( async () => {
            const result = await client.db("low-test001").collection("users001").findOne({oAuthID: oAuthID});
            if (result) {
                console.log(`Found user with AuthID ${oAuthID}:`);
                console.log(result)
            } else {
                console.log(`No users found with AuthID ${oAuthID}`);
            }
        })
    },
    findUserbyDBID: (databaseID) => {
        connectDB( async () => {
            const result = await client.db("low-test001").collection("users001").findOne(ObjectId(databaseID));
            if (result) {
                console.log(`Found user with databaseID ${databaseID}:`);
                console.log(result)
            } else {
                console.log(`No users found with databaseID ${databaseID}`);
            }
        })
    }
}

// methods.findUserbyName("Jane");

// methods.createUser("Jane", "40b99983-2d70-48ef-b918-f8fa525b8cc2");

// methods.findUserbyAuth("40b99983-2d70-48ef-b918-f8fa525b8cc2");
// methods.findUserbyDBID("629d8e73da60ebfb250442ae");