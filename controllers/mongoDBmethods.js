
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = process.env.DBURI.replace("username", process.env.DBADMIN).replace("password", process.env.DBADMINPW);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

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
        console.log(`Found one user named ${username}: `);
        console.log(result)
    } else {
        console.log(`No users found named ${username}`);
    }
}

async function updateUserbyName (client, data) {
    const result = await client.db("low-test001").collection("users001").updateOne({username: data.username}, {$set: data.updated});
    console.log(`${result.matchedCount} users were found`);
    console.log(`${result.modifiedCount} users were updated`);
}

main(updateUserbyName, {
    username: "Felicia",
    updated: {
        viewRestricted: false
    }
}).catch(console.error);

// {
//     username: "Felicia",
//     viewRestricted: false,
// }