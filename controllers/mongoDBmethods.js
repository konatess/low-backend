
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = process.env.DBURI.replace("username", process.env.DBADMIN).replace("password", process.env.DBADMINPW);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const tableNames = {
    usersTable: "users001",
}

async function main(callback, document) {
    try {
        await client.connect();

        await callback(client, document);
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

main(createUser, {
    username: "Scout",
    viewRestricted: false,
}).catch(console.error);

// {
//     username: "Felicia",
//     viewRestricted: false,
// }