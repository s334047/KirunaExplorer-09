import { app } from "../../index.ts";
import { describe, test, expect, jest, afterEach} from "@jest/globals";
import request from 'supertest';
import DaoConnection from "../../Dao/connectionDao.ts";
import Authenticator from "../../auth.ts";

jest.mock("../../Dao/connectionDao");
jest.mock("../../auth")
jest.mock('sqlite3');

afterEach(() => {
    jest.clearAllMocks();
})

describe('POST /api/connections', () => {
  const mockConnection = {Source: "Doc1", Target: "Doc2", ConnectionType: "relazione"};

  test('it should return status 200 if the user is authorized', async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      return next();
    })
    jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockResolvedValue(true);
    const response = await request(app).post('/api/connections').send(mockConnection);

    expect(response.status).toBe(200);
  });

  test(`it should return status 401 if the user is unauthorized`, async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req,res, next) => {
      res.status(401).json({ error: 'Not authorized' });;
    })
    const response = await request(app).post('/api/connections').send(mockConnection);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Not authorized');
  });

  test('it should return an error due to the DB', async () => {
    const mockErr = "Database error";
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
      return next();
    })
    jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockRejectedValue({
      message: `DocumentsConnection: ${mockErr}`,
      statusCode: 503
  });
    const response = await request(app).post('/api/connections').send(mockConnection);

    expect(response.status).toBe(503);
  });
});
