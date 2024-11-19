import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoArea from "../../Dao/areaDao.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/areaDao");
jest.mock("../../Dao/documentDao");
jest.mock("../../auth");

afterEach(() => {
    jest.clearAllMocks();
});

describe("PUT /api/documents/area", () => {
    const mockRequest = { area: "Area1", title: "Document1" };

    test("it should return 200 when area is successfully associated to a document", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockResolvedValue(1);
        jest.spyOn(DaoDocument.prototype, "getDocumentIdFromTitle").mockResolvedValue(2);
        jest.spyOn(DaoArea.prototype, "addAreaToDoc").mockResolvedValue(undefined);

        const response = await request(app).put("/api/documents/area").send(mockRequest);

        expect(response.status).toBe(200);
    });

    test("it should return 401 if user is not authorized", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            res.status(401).json({ error: "Not authorized" });
        });

        const response = await request(app).put("/api/documents/area").send(mockRequest);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized");
    });

    test("it should return 503 if DAO fails", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockRejectedValue(new Error("Database error"));

        const response = await request(app).put("/api/documents/area").send(mockRequest);

        expect(response.status).toBe(503);
    });
});
