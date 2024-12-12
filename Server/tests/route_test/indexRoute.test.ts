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

    describe("Error Handling Tests for Connections", () => {
      describe("GET /api/connections/:SourceDoc", () => {
        test("should return 404 when SourceDocId is not found", async () => {
          jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockResolvedValue(null);
    
          const response = await request(app).get("/api/connections/UnknownDoc");
    
          expect(response.status).toBe(404);
          expect(response.body.message).toBe("SourceDocId not found");
        });
    
        test("should return 503 on database error", async () => {
          jest.spyOn(DaoConnection.prototype, "GetDocumentsId").mockRejectedValue(new Error("Database error"));
    
          const response = await request(app).get("/api/connections/Doc1");
    
          expect(response.status).toBe(503);
        });
      });
    
      describe("GET /api/connections/info/:SourceDocId", () => {
        test("should return connection details successfully", async () => {
          const mockConnections = [{ id: 2, title: "Doc2", type: "Reference" }];
          jest.spyOn(DaoConnection.prototype, "GetDocumentInfoConnections").mockResolvedValue(mockConnections);
    
          const response = await request(app).get("/api/connections/info/1");
    
          expect(response.status).toBe(200);
          expect(response.body).toEqual(mockConnections);
        });
    
        test("should return 503 on database error", async () => {
          jest.spyOn(DaoConnection.prototype, "GetDocumentInfoConnections").mockRejectedValue(new Error("Database error"));
    
          const response = await request(app).get("/api/connections/info/1");
    
          expect(response.status).toBe(503);
        });
      });
    });

    describe("PUT /api/documents/area", () => {
      test("should return 503 on database error", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoArea.prototype, "getAreaIdFromName").mockRejectedValue(new Error("Database error"));
    
        const response = await request(app).put("/api/documents/area").send({ area: "Area1", title: "Doc1" });
    
        expect(response.status).toBe(503);
      });
    });
    
    describe("PUT /api/modifyGeoreference", () => {
      test("should modify georeference successfully", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoArea.prototype, "modifyGeoreference").mockResolvedValue(undefined);
    
        const response = await request(app)
          .put("/api/modifyGeoreference")
          .send({ coord: [10, 20], name: "Doc1" });
    
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Georeference modified successfully");
      });


      
    
    
      test("should return 503 on database error", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoArea.prototype, "modifyGeoreference").mockRejectedValue(new Error("Database error"));
    
        const response = await request(app)
          .put("/api/modifyGeoreference")
          .send({ coord: [10, 20], name: "Doc1" });
    
        expect(response.status).toBe(503);
      });
    });
    
  });
});

function connectionRouteHandler(reqMock: any, resMock: any) {
  throw new Error("Function not implemented.");
}


function documentRouteHandler(reqMock: {}, resMock: any) {
  throw new Error("Function not implemented.");
}
