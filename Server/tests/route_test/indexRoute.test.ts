import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoArea from "../../Dao/areaDao.ts";
import DaoConnection from "../../Dao/connectionDao.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import DaoResource from "../../Dao/resourceDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/documentDao");
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
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoDocument.prototype, "newDescription").mockResolvedValue(undefined);

      const response = await request(app).post("/api/documents").send(mockDocument);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Document add successfully");
    });

    
      
      
    test("should return 503 for database errors", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoDocument.prototype, "newDescription").mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/documents").send(mockDocument);

      expect(response.status).toBe(503);
    });
  });

  describe("GET /api/documents", () => {
    test("should fetch all documents successfully", async () => {
      const mockDocuments = [
        { id: 1, title: "Document1" },
        { id: 2, title: "Document2" },
      ];
      jest.spyOn(DaoDocument.prototype, "getAllDoc").mockResolvedValue(mockDocuments as any);

      const response = await request(app).get("/api/documents");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocuments);
    });

    test("should return 503 on database error", async () => {
      jest.spyOn(DaoDocument.prototype, "getAllDoc").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/documents");

      expect(response.status).toBe(503);
    });
  });

  describe("POST /api/connections", () => {
    const mockConnection = {
      SourceDocument: "Doc1",
      TargetDocument: "Doc2",
      ConnectionType: "Reference",
    };

    test("should create a connection successfully", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockResolvedValue(true);
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
        jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(true);
      
        const response = await request(app).post("/api/connections").send(mockConnection);
      
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Connection add successfully");
      });
      

      test("should return 503 for database errors", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
        jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(true);
        jest.spyOn(DaoConnection.prototype, "SetDocumentsConnection").mockRejectedValue(new Error("Database error"));
      
        const response = await request(app).post("/api/connections").send(mockConnection);
      
        expect(response.status).toBe(503);
      });
      

    test("should return 409 for duplicate connections", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(1);
      jest.spyOn(DaoConnection.prototype, "FindDuplicatedDocument").mockResolvedValue(false);

      const response = await request(app).post("/api/connections").send(mockConnection);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe("Duplicate connection on FindDuplicatedDocument");
    });
  });

  describe("GET /api/areas", () => {
    test("should fetch all areas successfully", async () => {
      const mockAreas = [{ id: 1, name: "Area1" }, { id: 2, name: "Area2" }];
      jest.spyOn(DaoArea.prototype, "getAllAreas").mockResolvedValue(mockAreas as any);

      const response = await request(app).get("/api/areas");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAreas);
    });

    test("should return 503 on database error", async () => {
      jest.spyOn(DaoArea.prototype, "getAllAreas").mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/areas");

      expect(response.status).toBe(503);
    });
  });

  describe("POST /api/originalResources", () => {
    const mockFile = Buffer.from("This is a test file.");
    const mockDocId = 123;

    test("should upload a file successfully", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoResource.prototype, "addOriginalResource").mockResolvedValue(undefined);

      const response = await request(app)
        .post("/api/originalResources")
        .field("docId", mockDocId.toString())
        .attach("file", mockFile, "testfile.pdf");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("File update successfully");
    });

    test("should return 400 if no file is uploaded", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app).post("/api/originalResources").field("docId", mockDocId.toString());

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No file updated");
    });

    test("should return 503 on database error", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoResource.prototype, "addOriginalResource").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/originalResources")
        .field("docId", mockDocId.toString())
        .attach("file", mockFile, "testfile.pdf");

      expect(response.status).toBe(503);
    });
  });
});