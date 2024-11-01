import bcrypt from 'bcrypt';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { DocumentDescription } from './Components/DocumentDescription.js';
import Dao from './Dao/daoStory1.js';
import { db } from './DB/db.js';
import { seedUsers } from './seedUsers.js';

const dao = new Dao();

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

// Seed initial users into the database
seedUsers();

/** Story 1 routes */
app.post('/api/documents', async (req: any, res: any) => {
    try {
        const newDoc: DocumentDescription = req.body;
        await dao.newDescription(newDoc.title, newDoc.stakeholder, newDoc.scale, newDoc.date, newDoc.type, newDoc.language, newDoc.page, newDoc.coordinate, newDoc.area, newDoc.description);
        res.status(201).json({ message: "Document created successfully" });
    } catch (error) {
        res.status(503).json({ error: error.message });
    }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        db.get(`SELECT * FROM User WHERE Username = ?`, [username], async (err, row: {
            Role: any;
            Username: any;
            Id: any; Password: string 
}) => {
            if (err) {
                return res.status(500).json({ error: "Internal Server Error" });
            }

            if (!row) {
                return res.status(401).json({ error: "Invalid username or password" });
            }

            const isMatch = await bcrypt.compare(password, row.Password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid username or password" });
            }

            // Create user session or JWT token
            const user = {
                id: row.Id,
                username: row.Username,
                role: row.Role,
            };

            res.json({ message: 'Login successful', user });
        });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// Activate the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

export { app };

