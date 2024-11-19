import cors from 'cors';
import express from 'express';
import { check, validationResult } from 'express-validator';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import DaoArea from './Dao/areaDao.ts';
import DaoConnection from './Dao/connectionDao.ts';
import DaoDocument from './Dao/documentDao.ts';
import DaoResource from './Dao/resourceDao.ts';
import Authenticator from './auth.ts';


const daoDocument = new DaoDocument();
const daoConnection = new DaoConnection();
const daoArea = new DaoArea();
const daoResource = new DaoResource();

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

const auth = new Authenticator(app);

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, './../originalResources'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname); //estensione
        const base = path.basename(file.originalname, ext); //nome file (senza estensione)
        cb(null, `${base}-${Date.now()}${ext}`);
    }
});
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    }});

const docValidation = [
    check('title').notEmpty().isString(),
    check('stakeholder').notEmpty().isString(),
    check('scale').notEmpty().isString(),
    check('date').notEmpty(),
    check('type').notEmpty().isString(),
    check('language').optional({nullable: true}).isString(),
    check('page').optional({nullable: true}).isInt(),
    check('coordinate').optional({nullable: true}),
    check('area').optional({nullable: true}),
    check('description').notEmpty().isString(),
    check().custom(({coordinate, area}) => {
        if((coordinate && area) || (!coordinate && !area))
            throw new Error('Select an area OR a point on the map')
    })
];

const connectionValidation = [
    check('SourceDocument').notEmpty().isString(),
    check('TargetDocument').notEmpty().isString(),
    check('ConnectionType').notEmpty().isString()
];

const areaValidation = [
    check('name').notEmpty().isString(),
    check('vertex').notEmpty()
];

/*** Users APIs */

app.post('/api/sessions', (req: any, res: any, next: any) => {
     auth.login(req, res, next);
    /*
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
    */
});

app.get('/api/sessions/current', (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
        return res.json(req.user);
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }

});

app.delete('/api/sessions/current', (req: any, res: any, next: any) => {
    auth.isLoggedIn(req, res, next)
    auth.logout(req, res, next)
    /*
    req.logout((err: any) => {
        if (err) {
            return res.status(500).send({ error: 'Logout failed' });
        }
        return res.end();
    });
    */
});
app.delete('/api/sessions/current', (req: any, res: any, next: any) => 
    auth.isLoggedIn(req, res, next),
    (req, res, next) => auth.logout(req, res, next)
);


/**Documents' APIs */

//add a new document
app.post('/api/documents', auth.isLoggedIn, docValidation, async (req: any, res: any) => {
    const errors = validationResult(req.body);
    if(!errors.isEmpty()){
        return res.status(422).json({message: 'invalid field'});
    }
    try {
        let number = null;
        if(req.body.area!=null){
            number=await daoArea.getAreaIdFromName(req.body.area)
        }
        await daoDocument.newDescription(req.body.title, req.body.stakeholder, req.body.scale, req.body.date, req.body.type, req.body.language, req.body.page, req.body.coordinate,number, req.body.description);
        res.status(200).json({message: 'Document add successfully'});
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})

//get the list of all documents
app.get('/api/documents', async (req: any, res: any)=>{
    try{
        const docs = await daoDocument.getAllDoc();
        res.json(docs);
    }catch(error){
        res.status(503).json({error: Error});
    }
})

//get all documents associate to an area
app.get('/api/documents/areas/:name',async (req: any, res: any)=>{
    try{
        const name=req.params.name;
        const id=await daoArea.getAreaIdFromName(name);
        const docs=await daoDocument.getAllDocOfArea(id);
        res.json(docs);
    }catch(error){
        res.status(503).json({error: Error});
    }
})

/** Connections' APIs */

//add a new connection between two documents
app.post('/api/connections', auth.isLoggedIn, connectionValidation, async (req: any, res: any) => {
    const errors = validationResult(req.body);
    if(!errors.isEmpty()){
        return res.status(422).json({message: 'invalid field'});
    }
    try {
        const SourceDoc=req.body.SourceDocument;
        const TargetDoc=req.body.TargetDocument;
        const Type=req.body.ConnectionType;
        await daoConnection.SetDocumentsConnection(SourceDoc, TargetDoc, Type);
        res.status(200).json({message: 'Connection add successfully'});
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})

//get the number of connection associate to a document
app.get('/api/connections/:SourceDoc', async (req: any, res: any) => {
    try {
        const { SourceDoc } = req.params;
        const connections = await daoConnection.GetDocumentConnections(SourceDoc);
        res.json(connections);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
});


/** Areas' APIs */

//associate an area to a document
app.put('/api/documents/area', auth.isLoggedIn, async (req: any, res: any) => { //add an existing area to a document
    try{
        const areaId = await daoArea.getAreaIdFromName(req.body.area);
        const documentId = await daoDocument.getDocumentIdFromTitle(req.body.title);
        await daoArea.addAreaToDoc(areaId, documentId);
        res.status(200).json({message: 'Association between area and document successfull'});
    }catch(error){
        res.status(503).json({error: Error});
    }
});

//get all the areas in the DB
app.get('/api/areas', async (req: any, res: any) => {   
    try{
        const areas = await daoArea.getAllAreas();
        res.json(areas);
    }catch(error){
        res.status(503).json({error: Error});
    }
})

//add a new area in the DB
app.post('/api/areas', auth.isLoggedIn, areaValidation, async (req: any, res: any) => { //add a new area in the db
    const errors = validationResult(req.body);
    if(!errors.isEmpty()){
        return res.status(422).json({message: 'invalid field'});
    }
    try{
        await daoArea.addArea(req.body.name, req.body.vertex);
        res.status(201).json({message: 'Area add successfully'});
    }catch(error){
        res.status(503).json({error: Error});
    }
});

//modify the coordinates of an area  (Story 5 routes)
app.put('/api/modifyGeoreference', auth.isLoggedIn, async (req: any, res: any)=>{
    try{
        const id = await daoDocument.getDocumentIdFromTitle(req.body.name);
        await daoArea.modifyGeoreference(id,req.body.coord,req.body.oldCoord,req.body.area,req.body.oldArea)
        res.status(200);
    }catch(error){
        res.status(503).json({error: Error});
    }
})

/** Original Resources' APIs - Story 7 */
app.post('/api/originalResources', auth.isLoggedIn, upload.single('file'), async (req: any, res: any) => {
    if(!req.file)
        return res.status(400).json({message: 'No file updated'});
    try{
        const relPath = path.relative(path.join(__dirname, './../../'), req.file.path);
        await daoResource.addOriginalResource(relPath, req.body.docId);
        res.status(200).json({message: 'File update successfully', filePath: relPath})
    }catch(error){
        res.status(503).json({error: Error});
    }
})

// Activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

export { app };
