import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import * as LocalStrategy from 'passport-local';
import DaoKX2 from './Dao/daoKX2.ts';
import Dao from './Dao/daoStory1-3.ts';
import DaoUser from './Dao/daoUser.ts';
import DaoStory4 from './Dao/daoStory4.ts';


const dao = new Dao();
const daoKX2 = new DaoKX2();
const daoUser = new DaoUser();
const daoStory4 = new DaoStory4();

const app = express();
const port = 3001;


app.use(express.json());
app.use(morgan('dev'));
const corsOption = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
};
app.use(cors(corsOption));

passport.use(new LocalStrategy.Strategy(async function verify(username, password, cb) {
    try {
        const user = await daoUser.getUser(username, password);
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

// authentication middleware
export const isLoggedIn = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
}

// session setup
const secret = "SECRETTTTTTT"
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

app.use((req: any, res: any, next: any) => {
    if (!req.session.memePoints) {
        req.session.memePoints = {};
    }
    next();
});

/** Story 1 routes */
app.post('/api/documents', async (req: any, res: any) => {
    try {
        let number = null;
        if (req.body.area != null) {
            number = await dao.getAreaIdFromName(req.body.area)
        }
        await dao.newDescription(req.body.title, req.body.stakeholder, req.body.scale, req.body.date, req.body.type, req.body.language, req.body.page, req.body.coordinate, number, req.body.description);
        res.status(200).json({ message: 'Document add successfully' });
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})

// Story KX2 routes
app.post('/api/connections', isLoggedIn, async (req: any, res: any) => {
    try {
        console.log(req.body)
        const SourceDoc = req.body.SourceDocument;
        const TargetDoc = req.body.TargetDocument;
        const Type = req.body.ConnectionType;
        await daoKX2.SetDocumentsConnection(SourceDoc, TargetDoc, Type);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})
app.get('/api/connections/:SourceDoc', async (req: any, res: any) => {
    try {
        const { SourceDoc } = req.params;
        const connections = await daoKX2.GetDocumentConnections(SourceDoc);
        res.json(connections);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
});

/** Story 3 routes */
app.put('/api/documents/area', isLoggedIn, async (req: any, res: any) => { //add an existing area to a document
    try {
        const areaId = await dao.getAreaIdFromName(req.body.area);
        const documentId = await dao.getDocumentIdFromTitle(req.body.title);
        await dao.addAreaToDoc(areaId, documentId);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
});

app.get('/api/areas', async (req: any, res: any) => {   //get all the areas in the db
    try {
        const areas = await dao.getAllAreas();
        res.json(areas);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})

app.post('/api/areas', isLoggedIn, async (req: any, res: any) => { //add a new area in the db
    try {
        await dao.addArea(req.body.name, req.body.vertex);
        res.status(201).json({ message: 'Area add successfully' });
    } catch (error) {
        res.status(503).json({ error: Error });
    }
});

/** Story 4 routes */
app.get('/api/documents', async (req: any, res: any) => {
    try {
        const docs = await daoStory4.getAllDoc();
        res.json(docs);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})


app.get('/api/area/docs/:name', async (req: any, res: any) => {
    try {
        const name = req.params.name;
        const id = await dao.getAreaIdFromName(name);
        const docs = await daoStory4.getAllDocOfArea(id);
        res.json(docs);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})
//API AUTENTICATION

app.post('/api/sessions', (req: any, res: any, next: any) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).send(info);
        }

        req.login(user, (err: any) => {
            if (err) {
                return next(err);
            }
            return res.status(201).json(req.user);
        });
    })(req, res, next);
});

app.get('/api/sessions/current', (req: any, res: any) => {
    if (req.isAuthenticated()) {
        return res.json(req.user);
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }
});


app.delete('/api/sessions/current', (req: any, res: any) => {
    req.logout((err: any) => {
        if (err) {
            return res.status(500).send({ error: 'Logout failed' });
        }
        return res.end();
    });
});
// Activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

export { app };

app.get('/', (req, res) => {
    res.send('Hello World!');
});