import cors from 'cors';
import express from 'express';
import { check, validationResult } from 'express-validator';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mime from 'mime-types';

import DaoArea from './Dao/areaDao.ts';
import DaoConnection from './Dao/connectionDao.ts';
import DaoDocument from './Dao/documentDao.ts';
import DaoResource from './Dao/resourceDao.ts';
import Authenticator from './auth.ts';
import Resource from './Components/Resource.ts';


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
    exposedHeaders: ['Content-Disposition']
};
app.use(cors(corsOption));

const auth = new Authenticator(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, './OriginalResources'));
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
    console.log(req.body)
    if(!req.file)
        return res.status(400).json({message: 'No file updated'});
    try{
        const relPath = path.relative(path.join(__dirname, './'), req.file.path); //OriginalResources\...
        await daoResource.addOriginalResource(relPath, req.body.docId);
        res.status(200).json({message: 'File update successfully', filePath: relPath})
    }catch(error){
        res.status(503).json({error: Error});
    }
})

app.get('/api/originalResources/:docId', auth.isLoggedIn, async(req: any, res: any) => {
    try{
        const resources: Resource[] = await daoResource.getResourcesByDoc(req.params.docId);
        let files = resources.map((resource) => {
            const normalizedPath = resource.path.replace(/\\/g, '/');
            const filePath = path.resolve(__dirname, normalizedPath); //praticamente concatena il path assoluto con quello relativo
            if(fs.existsSync(filePath)){
                //const fileContent = fs.readFileSync(filePath); //è un buffer
                return{
                    id: resource.id,
                    name: path.basename(filePath),
                    //type : mime.lookup(filePath) || 'application/octet-stream',
                    //content: fileContent.toString('base64') //converte in stringa in Base64 per poterlo trasmettere in JSON
                }
            }else{
                return null;
            }
        }).filter((file) => file != null)
        res.json(files);
    }catch(err){
        console.error('Error reading file: ', err);
        res.status(503).json({error: Error})
    }
})

//scaricare una SINGOLA resource associata a un documento 
app.get('/api/originalResources/download/:id', auth.isLoggedIn, async (req: any, res: any) => {
    try{
        const resource: Resource = await daoResource.getResourceById(req.params.id);
        const normalizedPath = resource.path.replace(/\\/g, '/');
        const filePath = path.resolve(__dirname, normalizedPath);

        if(fs.existsSync(filePath)){
            const fileContent = fs.readFileSync(filePath);
            const fileName = path.basename(filePath);
            res.setHeader('Content-Type', 'application/octet-stream'); //informa il client che il contenuto della risposta è un flusso di byte per il download
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); //forza il download senza aprire il file+nome che deve avere il file quando viene scaricato
            res.send(fileContent);
        }else{
            res.status(404).json({error: 'File not found'});
        }
    }catch(err){
        console.error('Error reading file: ', err);
        res.status(503).json({error: Error})
    }
})

// Activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

export { app };
