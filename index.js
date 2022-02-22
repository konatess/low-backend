import userRoute from './routes/user.js';
import loginRoute from './routes/login.js';
import oauthCallbackRoute from './routes/oauth-callback.js';
import logoutRoute from'./routes/logout.js';
import express, { json } from 'express';
import expressSession from 'express-session';
import cors from 'cors';
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
app.use('/user', userRoute);
app.use('/login', loginRoute);
app.use('/oauth-callback', oauthCallbackRoute);
app.use('/logout', logoutRoute);

// start server
app.listen(PORT, () => console.log(`FusionAuth example app listening on port ${PORT}.`));
