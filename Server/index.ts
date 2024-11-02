import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Dao from './Dao/daoStory1-3.js';
import DaoKX2 from './Dao/daoKX2.js';
import { DocumentDescription } from './Components/DocumentDescription.js';

const dao = new Dao();
const daoKX2 = new DaoKX2();

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

/** Story 1 routes */
app.post('/api/documents', async (req: any, res: any) => {
    try {
        const newDoc: DocumentDescription = req.body;
        await dao.newDescription(newDoc.title, newDoc.stakeholder, newDoc.scale, newDoc.date, newDoc.type, newDoc.language, newDoc.page, newDoc.coordinate, newDoc.area, newDoc.description);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})

// Story KX2 routes
app.post('/api/connections', async (req: any, res: any) => {
    try {
        const { SourceDoc, TargetDoc, Type } = req.body;
        daoKX2.SetDocumentsConnection(SourceDoc, TargetDoc, Type);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
})
app.get('/api/connections/:SourceDoc', async (req: any, res: any) => {
    try {
        const { SourceDoc } = req.params;
        const connections = daoKX2.GetDocumentConnections(SourceDoc);
        res.json(connections);
    } catch (error) {
        res.status(503).json({ error: Error });
    }
});

/** Story 3 routes */
app.put('/api/documents/:id/area', async (req: any, res: any) => { //add an area/coordinate to a document
    try{
        console.log(req.params.id, req.body.coord, req.body.area)
        await dao.addGeoreference(req.params.id, req.body.coord, req.body.area);
    }catch(error){
        res.status(503).json({error: Error});
    }
});

app.get('/api/areas', async (req: any, res: any) => {   //get all the areas in the db
    try{
        const areas = await dao.getAllAreas();
        res.json(areas);
    }catch(error){
        res.status(503).json({error: Error});
    }
})

app.post('/api/areas', async (req: any, res: any) => { //add a new area in the db
    try{
        await dao.addArea(req.body.name, req.body.vertex);
    }catch(error){
        res.status(503).json({error: Error});
    }
});

// Activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

export { app };

