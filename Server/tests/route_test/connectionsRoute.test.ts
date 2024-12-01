import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoConnection from "../../Dao/connectionDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/connectionDao");
jest.mock("../../auth");

afterEach(() => {
    jest.clearAllMocks();
});

describe("POST /api/connections", () => {
    const mockConnection = {
        SourceDocument: "Doc1",
        TargetDocument: "Doc2",
        ConnectionType: "relation",
    };

    test("it should return 200 if connection is created", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId")
            .mockResolvedValueOnce(1) // SourceDocId
            .mockResolvedValueOnce(2); // TargetDocId
        jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(true);
        jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockResolvedValue(true);

        const response = await request(app)
            .post("/api/connections")
            .send(mockConnection);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Connection add successfully");
    });

    test("it should return 401 if user is not authorized", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            res.status(401).json({ error: "Not authorized" });
        });

        const response = await request(app)
            .post("/api/connections")
            .send(mockConnection);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized");
    });

    test("it should return 503 if database fails", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockRejectedValue(new Error("Database error"));

        const response = await request(app)
            .post("/api/connections")
            .send(mockConnection);

        expect(response.status).toBe(503);
       
    });

    test("it should return 404 if documents are not found", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId")
            .mockResolvedValueOnce(null) // SourceDocId not found
            .mockResolvedValueOnce(2); // TargetDocId

        const response = await request(app)
            .post("/api/connections")
            .send(mockConnection);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("SourceDocId or TargetDocId not found");
    });

    test("it should return 409 if the connection is duplicated", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId")
            .mockResolvedValueOnce(1) // SourceDocId
            .mockResolvedValueOnce(2); // TargetDocId
        jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(false);

        const response = await request(app)
            .post("/api/connections")
            .send(mockConnection);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe("Duplicate connection on FindDuplicatedDocument");
    });
});
