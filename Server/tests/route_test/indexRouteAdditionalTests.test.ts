import { afterEach, describe, expect, jest, test } from "@jest/globals";
import fs from "fs";
import request from "supertest";
import DaoArea from "../../Dao/areaDao.ts";
import DaoConnection from "../../Dao/connectionDao.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import DaoResource from "../../Dao/resourceDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/areaDao.ts");
jest.mock("../../Dao/documentDao.ts");
jest.mock("../../Dao/connectionDao.ts");
jest.mock("../../Dao/resourceDao.ts");
jest.mock("../../auth.ts");

describe("Additional Tests for Uncovered Lines in index.ts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/connections/info/:SourceDocId - Database Errors", () => {
    test("should return 503 if daoConnection.GetDocumentInfoConnections throws an error", async () => {
      jest.spyOn(DaoConnection.prototype, "GetDocumentInfoConnections").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/connections/info/1");

      expect(response.status).toBe(503);
    });
  });

  describe("GET /api/originalResources/:docId - File Handling", () => {
    test("should return an empty array if no files exist", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoResource.prototype, "getResourcesByDoc").mockResolvedValue([]);

      const response = await request(app).get("/api/originalResources/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test("should filter out non-existent files from resources", async () => {
      const mockResources = [
        { id: 1, path: "resources/file1.pdf" },
        { id: 2, path: "resources/nonexistent.pdf" },
      ];
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoResource.prototype, "getResourcesByDoc").mockResolvedValue(mockResources as any);
      jest.spyOn(fs, "existsSync").mockImplementation((filePath) =>
        filePath.toString().includes("file1.pdf") // Only the first file exists
      );

      const response = await request(app).get("/api/originalResources/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{ id: 1, name: "file1.pdf" }]);
    });
  });

  describe("POST /api/originalResources - File Upload", () => {
    test("should return 503 if daoResource.addOriginalResource throws an error", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoResource.prototype, "addOriginalResource").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/originalResources")
        .field("docId", "123")
        .attach("file", Buffer.from("Test file"), "testfile.pdf");

      expect(response.status).toBe(503);
    });

    test("should return 400 if no file is uploaded", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());

      const response = await request(app)
        .post("/api/originalResources")
        .field("docId", "123");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "No file updated" });
    });
  });

  describe("GET /api/connections/:SourceDoc - Error Handling", () => {
    test("should return 404 if SourceDocId is not found", async () => {
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(null);

      const response = await request(app).get("/api/connections/UnknownDoc");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "SourceDocId not found" });
    });

    test("should return 503 if daoConnection.GetDocumentConnections throws an error", async () => {
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
      jest.spyOn(DaoConnection.prototype, "GetDocumentConnections").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/connections/Doc1");

      expect(response.status).toBe(503);
    });
  });

  describe("PUT /api/modifyGeoreference - Error Scenarios", () => {
    test("should return 503 if daoArea.modifyGeoreference throws an error", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoArea.prototype, "modifyGeoreference").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/modifyGeoreference")
        .send({ coord: [10, 20], name: "Doc1" });

      expect(response.status).toBe(503);
    });
  });

  describe("POST /api/documents - Validation Errors", () => {
    test("should return 503 if daoDocument.newDescription throws an error", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockResolvedValue(null);
      jest.spyOn(DaoDocument.prototype, "newDescription").mockRejectedValue(new Error("Database error"));

      const validDocument = {
        title: "Document Title",
        stakeholder: "Stakeholder1",
        scale: "Scale1",
        date: "2023-12-06",
        type: "Type1",
        description: "Description1",
      };

      const response = await request(app).post("/api/documents").send(validDocument);

      expect(response.status).toBe(503);
    });
  });

  describe("DELETE /api/sessions/current - Session Management", () => {
    test("should return 200 if user logs out successfully", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(Authenticator.prototype, "logout").mockImplementation((_req, res, _next) => {
        return res.status(200).end();
      });

      const response = await request(app).delete("/api/sessions/current");

      expect(response.status).toBe(200);
    });
  });

  describe("POST /api/connections - Error Scenarios", () => {
    test("should return 404 if SourceDocId or TargetDocId is not found", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValueOnce(null);

      const invalidConnection = {
        SourceDocument: "UnknownSourceDoc",
        TargetDocument: "UnknownTargetDoc",
        ConnectionType: "Reference",
      };

      const response = await request(app).post("/api/connections").send(invalidConnection);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "SourceDocId or TargetDocId not found" });
    });

    test("should return 409 if the connection is duplicated", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
      jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(false);

      const duplicateConnection = {
        SourceDocument: "Doc1",
        TargetDocument: "Doc2",
        ConnectionType: "Reference",
      };

      const response = await request(app).post("/api/connections").send(duplicateConnection);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Duplicate connection on FindDuplicatedDocument" });
    });

    test("should return 503 if daoConnection.SetDocumentsConnection throws an error", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
      jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(true);
      jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockRejectedValue(new Error("Database error"));

      const connection = {
        SourceDocument: "Doc1",
        TargetDocument: "Doc2",
        ConnectionType: "Reference",
      };

      const response = await request(app).post("/api/connections").send(connection);

      expect(response.status).toBe(503);
    });
  });

  describe("GET /api/connections - General Tests", () => {
    test("should return 503 if daoConnection.GetConnections throws an error", async () => {
      jest.spyOn(DaoConnection.prototype, "GetConnections").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/connections");

      expect(response.status).toBe(503);
    });
  });

  describe("Error Handling for Undefined Routes", () => {
    test("should return 404 for undefined routes", async () => {
      const response = await request(app).get("/undefined-route");

      expect(response.status).toBe(404);
    });
  });

  describe("POST /api/areas - Adding a new area", () => {
    test("should return 201 if a new area is added successfully", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((_req, _res, next) => next());
      jest.spyOn(DaoArea.prototype, "addArea").mockResolvedValue(undefined);

      const newArea = {
        name: "Test Area",
        vertex: [[10, 20], [30, 40], [50, 60]],
      };

      const response = await request(app).post("/api/areas").send(newArea);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Area add successfully" });
    });

  

  describe("GET /api/documents/areas/:name - Fetch documents by area name", () => {
    test("should return documents successfully", async () => {
      const mockDocs = [{ id: 1, title: "Doc1" }, { id: 2, title: "Doc2" }];
      jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockResolvedValue(1);
      jest.spyOn(DaoDocument.prototype, "getAllDocOfArea").mockResolvedValue(mockDocs as any);

      const response = await request(app).get("/api/documents/areas/Area1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocs);
    });

    test("should return 503 if fetching documents fails", async () => {
      jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockResolvedValue(1);
      jest.spyOn(DaoDocument.prototype, "getAllDocOfArea").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/documents/areas/Area1");

      expect(response.status).toBe(503);
      
    });
  });

  describe("GET /api/originalResources/download/:id - File Download", () => {
    test("should return a file for valid resource ID", async () => {
      const mockResource = { id: 1, path: "resources/file1.pdf" };
      jest.spyOn(DaoResource.prototype, "getResourceById").mockResolvedValue(mockResource as any);
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("file content"));

      const response = await request(app).get("/api/originalResources/download/1");

      expect(response.status).toBe(200);
      expect(response.header["content-type"]).toBe("application/octet-stream");
    });

    test("should return 404 if file does not exist", async () => {
      const mockResource = { id: 1, path: "resources/nonexistent.pdf" };
      jest.spyOn(DaoResource.prototype, "getResourceById").mockResolvedValue(mockResource as any);
      jest.spyOn(fs, "existsSync").mockReturnValue(false);

      const response = await request(app).get("/api/originalResources/download/1");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "File not found" });
    });

    test("should return 503 if fetching resource fails", async () => {
      jest.spyOn(DaoResource.prototype, "getResourceById").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/originalResources/download/1");

      expect(response.status).toBe(503);
      
    });
  });

  describe("POST /api/sessions - Authentication", () => {
    test("should return 200 if login is successful", async () => {
      jest.spyOn(Authenticator.prototype, "login").mockImplementation((_req, res, _next) => {
        return res.status(200).json({ message: "Login successful" });
      });

      const credentials = { username: "testuser", password: "testpass" };

      const response = await request(app).post("/api/sessions").send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Login successful" });
    });

    test("should return 401 if authentication fails", async () => {
      jest.spyOn(Authenticator.prototype, "login").mockImplementation((_req, res, _next) => {
        return res.status(401).json({ error: "Authentication failed" });
      });

      const invalidCredentials = { username: "invaliduser", password: "wrongpass" };

      const response = await request(app).post("/api/sessions").send(invalidCredentials);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Authentication failed" });
    });
});
  });
});