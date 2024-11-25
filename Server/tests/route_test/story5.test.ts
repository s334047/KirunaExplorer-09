import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import Authenticator from "../../auth.ts";
import DaoArea from "../../Dao/areaDao.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import { app } from "../../index.ts";

jest.mock("../../auth");
jest.mock("../../Dao/documentDao.ts");
jest.mock("../../Dao/areaDao.ts");

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("PUT /api/modifyGeoreference", () => {
    const mockPayload = {
        name: "DocumentName",
        coord: [10, 20],
        oldCoord: null,
        area: null,
        oldArea: null,
    };

    test("it should modify georeference successfully", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoDocument.prototype, "getDocumentIdFromTitle").mockResolvedValue(1);
        jest.spyOn(DaoArea.prototype, "modifyGeoreference").mockResolvedValue(undefined);

        const response = await request(app).put("/api/modifyGeoreference").send(mockPayload);

        expect(response.status).toBe(200);
    }, 10000); // Increased timeout

    test("it should return 401 if user is not authorized", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
            res.status(401).json({ error: "Not authorized" });
        });

        const response = await request(app).put("/api/modifyGeoreference").send(mockPayload);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Not authorized");
    });

    test("it should return 503 if DAO fails", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoDocument.prototype, "getDocumentIdFromTitle").mockResolvedValue(1);
        jest.spyOn(DaoArea.prototype, "modifyGeoreference").mockRejectedValue(new Error("Database error"));

        const response = await request(app).put("/api/modifyGeoreference").send(mockPayload);

        expect(response.status).toBe(503);
    });
});
