import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Dao from './Dao/daoStory1-3.js';
import { DocumentDescription } from './Components/DocumentDescription.js';

const dao = new Dao();

const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan('dev'));
const corsOption = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
}
app.use(cors(corsOption));

/** Story 1 routes */
app.post('/api/documents', async (req: any, res: any) => {
    try{
        const newDoc : DocumentDescription = req.body;
        dao.newDescription(newDoc.title, newDoc.stakeholder, newDoc.scale, newDoc.date, newDoc.type, newDoc.language, newDoc.page, newDoc.coordinate, newDoc.area, newDoc.description);
    }catch (error){
        res.status(503).json({error: Error});
    }
})

/** Story 3 routes */
app.put('/api/documents/:id', async (req: any, res: any) => {
    try{
        console.log(req.params.id, req.body.coord, req.body.area)
        dao.addGeoreference(req.params.id, req.body.coord, req.body.area);
    }catch(error){
        res.status(503).json({error: Error});
    }
});

app.get('/api/areas', async (req: any, res: any) => {
    try{
        if(req.body.par===0)
            dao.getAllAreas();
        else(req.body.par===1)
            dao.getAllCoordinates();
    }catch(error){
        res.status(503).json({error: Error});
    }
})

//activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
});

export {app};