import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import https from 'https';
import { Server } from 'socket.io';
import fs from 'fs';
import passport from 'passport';
import session from 'cookie-session';

const app = express();

const key = fs.readFileSync('./secureKeys/key.pem')
const cert = fs.readFileSync('./secureKeys/cert.pem')

const server = https.createServer({ key, cert }, app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
})

app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

app.use(session({
    secret: process.env.Client_Secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true },
    keys: [process.env.Client_Secret]
}));

app.use(passport.initialize());
app.use(passport.session());

// Import Routes
import userRoutes from './routes/user.routes.js';
import userProfileRoutes from './routes/userProfile.routes.js';
import userNotifications from './routes/userNotifications.routes.js';
import userSettings from './routes/userSettings.routes.js';
import GoogleAuth from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';

// Use Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/user-profile', userProfileRoutes);
app.use('/api/v1/user-notifications', userNotifications);
app.use('/api/v1/user-settings', userSettings);
app.use('/auth', GoogleAuth);
app.use('/api/v1/document', documentRoutes);

export { app, io, server };