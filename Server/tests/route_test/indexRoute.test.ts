import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoArea from "../../Dao/areaDao.ts";
import DaoConnection from "../../Dao/connectionDao.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import DaoResource from "../../Dao/resourceDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/documentDao.ts");
jest.mock("../../Dao/connectionDao");
jest.mock("../../Dao/areaDao");
jest.mock("../../Dao/resourceDao");
jest.mock("../../auth");

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe("Testing index.ts Routes", () => {
  describe("POST /api/documents", () => {
    const mockDocument = {
      title: "Document1",
      stakeholder: "Stakeholder1",
      scale: "Scale1",
      date: "2023-12-06",
      type: "Type1",
      description: "Description1",
    };

    test("should create a document successfully", async () => {
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((_req, _res, next) => next());
      jest
        .spyOn(DaoDocument.prototype, "newDescription")
        .mockResolvedValue(undefined);

      const response = await request(app).post("/api/documents").send(mockDocument);

      validateResponse(response, 200, "Document add successfully");
    });

    test("should return 503 for database errors", async () => {
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((_req, _res, next) => next());
      jest
        .spyOn(DaoDocument.prototype, "newDescription")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/documents").send(mockDocument);

      validateResponse(response, 503);
    });
  });

  describe("GET /api/documents", () => {
    test("should fetch all documents successfully", async () => {
      const mockDocuments = [
        { id: 1, title: "Document1" },
        { id: 2, title: "Document2" },
      ];
      jest
        .spyOn(DaoDocument.prototype, "getAllDoc")
        .mockResolvedValue(mockDocuments as any);

      const response = await request(app).get("/api/documents");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocuments);
    });

    test("should return 503 on database error", async () => {
      jest
        .spyOn(DaoDocument.prototype, "getAllDoc")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/documents");

      validateResponse(response, 503);
    });
  });

  describe("POST /api/connections", () => {
    const mockConnection = {
      SourceDocument: "Doc1",
      TargetDocument: "Doc2",
      ConnectionType: "Reference",
    };

    test("should create a connection successfully", async () => {
      mockAuthenticator();
      mockDaoConnection();

      const response = await request(app).post("/api/connections").send(mockConnection);

      validateResponse(response, 200, "Connection add successfully");
    });

    test("should return 503 for database errors", async () => {
      mockAuthenticator();
      mockDaoConnection(true);

      const response = await request(app).post("/api/connections").send(mockConnection);

      validateResponse(response, 503);
    });

    test("should return 409 for duplicate connections", async () => {
      mockAuthenticator();
      jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(false);

      const response = await request(app).post("/api/connections").send(mockConnection);

      validateResponse(response, 409, "Duplicate connection on FindDuplicatedDocument");
    });
  });

  describe("GET /api/areas", () => {
    test("should fetch all areas successfully", async () => {
      const mockAreas = [{ id: 1, name: "Area1" }, { id: 2, name: "Area2" }];
      jest
        .spyOn(DaoArea.prototype, "getAllAreas")
        .mockResolvedValue(mockAreas as any);

      const response = await request(app).get("/api/areas");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAreas);
    });

    test("should return 503 on database error", async () => {
      jest
        .spyOn(DaoArea.prototype, "getAllAreas")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/areas");

      validateResponse(response, 503);
    });
  });

  describe("POST /api/originalResources", () => {
    const mockFile = Buffer.from("This is a test file.");
    const mockDocId = 123;

    test("should upload a file successfully", async () => {
      mockAuthenticator();
      jest
        .spyOn(DaoResource.prototype, "addOriginalResource")
        .mockResolvedValue(undefined);

      const response = await uploadFile(mockDocId, mockFile);

      validateResponse(response, 200, "File update successfully");
    });

    test("should return 400 if no file is uploaded", async () => {
      mockAuthenticator();

      const response = await request(app)
        .post("/api/originalResources")
        .field("docId", mockDocId.toString());

      validateResponse(response, 400, "No file updated");
    });

    test("should return 503 on database error", async () => {
      mockAuthenticator();
      jest
        .spyOn(DaoResource.prototype, "addOriginalResource")
        .mockRejectedValue(new Error("Database error"));

      const response = await uploadFile(mockDocId, mockFile);

      validateResponse(response, 503);
    });
  });

  describe("PUT /api/documents/area", () => {
    test("should return 503 on database error", async () => {
      mockAuthenticator();
      jest
        .spyOn(DaoArea.prototype, "getAreaIdFromName")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/documents/area").send({
        area: "Area1",
        title: "Doc1",
      });

      validateResponse(response, 503);
    });
  });

  describe("PUT /api/modifyGeoreference", () => {
    test("should modify georeference successfully", async () => {
      mockAuthenticator();
      jest
        .spyOn(DaoArea.prototype, "modifyGeoreference")
        .mockResolvedValue(undefined);

      const response = await request(app)
        .put("/api/modifyGeoreference")
        .send({ coord: [10, 20], name: "Doc1" });

      validateResponse(response, 200, "Georeference modified successfully");
    });

    test("should return 503 on database error", async () => {
      mockAuthenticator();
      jest
        .spyOn(DaoArea.prototype, "modifyGeoreference")
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/modifyGeoreference")
        .send({ coord: [10, 20], name: "Doc1" });

      validateResponse(response, 503);
    });
  });
});

// Helper functions
function mockAuthenticator() {
  jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
}

function mockDaoConnection(throwError = false) {
  jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
  jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(true);
  jest
    .spyOn(DaoConnection.prototype, "SetDocumentsConnection")
    .mockImplementation(() => (throwError ? Promise.reject(new Error("Database error")) : Promise.resolve(true)));
}

async function uploadFile(docId, file) {
  return request(app)
    .post("/api/originalResources")
    .field("docId", docId.toString())
    .attach("file", file, "testfile.pdf");
}

function validateResponse(response, expectedStatus, expectedMessage = null) {
  expect(response.status).toBe(expectedStatus);
  if (expectedMessage) {
    expect(response.body.message).toBe(expectedMessage);
  }
}
