import { app } from "../../index.ts";
import { describe, test, expect, jest, afterEach} from "@jest/globals";
import request from 'supertest';
import DaoKX2 from "../../Dao/daoKX2.ts";

jest.mock("../../Dao/daoKX2");
jest.mock('sqlite3');

afterEach(() => {
    jest.clearAllMocks();
})

// Mock per req.isAuthenticated per simulare un utente autenticato
const mockIsAuthenticated = jest.fn();

jest.spyOn(require('../../index'), 'isLoggedIn').mockImplementation((req: any, res: any, next: any) => {
    console.log('isLoggedIn chiamato');
    if (mockIsAuthenticated()) {
        console.log('autorizzato');
      return next();
    }
    return res.status(401).json({ error: 'Not authorized' });
  });

describe('POST /api/connections', () => {

  test(`it should return status 401 if the user is unauthorized`, async () => {
    mockIsAuthenticated.mockReturnValue(false);     //utente non autenticato

    const response = await request(app).post('/api/connections')
      .send({
        SourceDocument: 'Doc1',
        TargetDocument: 'Doc2',
        ConnectionType: 'relazione',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Not authorized');
  });

  test('dovrebbe restituire 200 e chiamare SetDocumentsConnection se l\'utente è autenticato', async () => {
    mockIsAuthenticated.mockReturnValue(true); // Simula che l'utente sia autenticato

    const mockSetConnection = jest.spyOn(DaoKX2.prototype, "SetDocumentsConnection").mockResolvedValue(true);

    const response = await request(app).post('/api/connections')
      .send({
        SourceDocument: 'Doc1',
        TargetDocument: 'Doc2',
        ConnectionType: 'relazione',
      });

    expect(response.status).toBe(200);
    expect(mockSetConnection).toHaveBeenCalledWith('Doc1', 'Doc2', 'relazione');
  });

/*
  test('dovrebbe restituire 503 se si verifica un errore durante SetDocumentsConnection', async () => {
    // Simula che l'utente sia autenticato
    mockIsAuthenticated.mockReturnValue(true);

    // Simula un errore in SetDocumentsConnection
    mockSetDocumentsConnection.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/connections')
      .send({
        SourceDocument: 'Doc1',
        TargetDocument: 'Doc2',
        ConnectionType: 'relazione',
      });

    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Database error');
  });
  */
});
