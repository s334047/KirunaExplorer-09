import UserDao from './Dao/daoUser.ts';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import * as LocalStrategy from 'passport-local';

export default class Authenticator {
    private readonly app: express.Application
    private readonly dao : UserDao

    constructor(app: express.Application){
        this.app = app
        this.dao = new UserDao()
        this.initAuth()
    }

    initAuth(){
        this.app.use(session({
            secret: "SECRETTTTTTT",
            resave: false,
            saveUninitialized: false,
          }));

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        const copy = this;

        passport.use(new LocalStrategy.Strategy(async function verify(username, password, cb) {
            try {
                const user = await copy.dao.getUser(username, password);
                if (!user) {
                    return cb(null, false, new Error('Incorrect username or password.'));
                }
                return cb(null, user);
            } catch (err) {
                return cb(err);
            }
        }));

        passport.serializeUser((user, cb) => cb(null, user));
        passport.deserializeUser((user, cb) => cb(null, user));
    }

    async login(req: any, res: any, next: any) {
        passport.authenticate("local", (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(401).json({ error: 'Authentication failed' });

            req.login(user, (err) => {
                if (err) return next(err);
                res.status(200).json(user); // Invia l'utente autenticato come risposta
            });
        })(req, res, next);
    }

    async logout(req: any, res: any, next: any) {
        req.logout((err) => {
            if (err) return next(err);
            res.status(200).end();
        });
    }

    isLoggedIn(req: any, res: any, next: any) {
        if (req.isAuthenticated()) {
            return next();
        }
        return res.status(401).json({ error: 'Not authorized' });
    }

    
}