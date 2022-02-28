import userStatus from './routes/userStatus.js';
import userManage from './routes/userManage.js';
import loginRoute from './routes/login.js';
import oauthCallbackRoute from './routes/oauth-callback.js';
import logoutRoute from './routes/logout.js';
import storyRoutes from './routes/story.js';
import express, { json } from 'express';
import expressSession from 'express-session';
import cors from 'cors';
import db from './models/index.js'
const PORT = process.env.PORT || 3001;

// configure Express app and install the JSON middleware for parsing JSON bodies
const app = express();
app.use(json());

// create session
app.use(expressSession({
    secret: 'confusion', 
    resave: false, 
    saveUninitialized: true, 
    oauthState: '',
    cookie: {
        secure: 'auto',
        httpOnly: true,
        maxAge: 3600000
    }
}));

// configure CORS
app.use(cors({
  	origin: true,
  	credentials: true
}));

// use routes
app.use('/status', userStatus);
app.use('/login', loginRoute);
app.use('/oauth-callback', oauthCallbackRoute);
app.use('/logout', logoutRoute);
app.use('/story', storyRoutes);
app.use('/user', userManage);

// start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));

// check db
try {
    await db.sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

// sync db
try {
	await db.sequelize.sync();
	console.log("Database synched")
} catch (error) {
	console.error("Database sync failed: ", error)
}