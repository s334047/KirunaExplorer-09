import { afterEach, describe, expect, jest, test, beforeEach } from "@jest/globals";
import fs from 'fs';
import request from "supertest";
import DaoResource from "../../Dao/resourceDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/resourceDao");
jest.mock("../../auth");
jest.mock("sqlite3");

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  jest.restoreAllMocks();
  jest.resetAllMocks();
});
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.resetAllMocks();
  jest.resetModules();
});

describe("Story 7 - Original Resource APIs", () => {
  describe("POST /api/originalResources", () => {
    const mockFile = Buffer.from("This is a test file.");
    const mockFilePath = "mock/test/path/resource.pdf";
    const mockDocId = 123;

    test("it should upload an original resource file successfully", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoResource.prototype, "addOriginalResource").mockResolvedValue();

      const response = await request(app)
        .post("/api/originalResources")
        .set("Content-Type", "multipart/form-data")
        .field("docId", mockDocId.toString())
        .attach("file", mockFile, mockFilePath);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("File update successfully");
    });

    test("it should return 400 if no file is uploaded", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app)
        .post("/api/originalResources")
        .set("Content-Type", "multipart/form-data")
        .field("docId", mockDocId.toString());

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("No file updated");
    });

    test("it should return 503 if the database fails", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoResource.prototype, "addOriginalResource").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/originalResources")
        .set("Content-Type", "multipart/form-data")
        .field("docId", mockDocId.toString())
        .attach("file", mockFile, mockFilePath);

      expect(response.status).toBe(503);
      
    });
  });

  describe("GET /api/originalResources/:docId", () => {
    const mockDocId = 123;
    const mockResources = [
      {
        id: 1,
        path: "OriginalResources/test_resource.pdf",
        docId: mockDocId,
      },
    ];

    test("it should retrieve all original resources for a document", async () => {
        jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
        jest.spyOn(DaoResource.prototype, "getResourcesByDoc").mockResolvedValue(mockResources);
      
        jest.spyOn(fs, "existsSync").mockReturnValue(true);
        jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("Base64EncodedContent"));
      
        const response = await request(app)
          .get(`/api/originalResources/${mockDocId}`)
          .set("Cookie", ["session=mock-session-cookie"]);
      
        expect(response.status).toBe(200);
        expect(response.body).toEqual([
          {
            id: 1,
            name: "test_resource.pdf",
          },
        ]);
      });
      
      

    test("it should return 503 if the database query fails", async () => {
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
      jest.spyOn(DaoResource.prototype, "getResourcesByDoc").mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(`/api/originalResources/${mockDocId}`)
        .set("Cookie", ["session=mock-session-cookie"]);

      expect(response.status).toBe(503);
      
    });
  });

  describe("GET /api/originalResources/download/:id", () => {
    const mockResourceId = 1;
    const mockResource = {
      id: mockResourceId,
      path: "OriginalResources/test_resource.pdf",
      docId: 123,
    };

    test("it should download a specific resource file successfully", async () => {
      jest.spyOn(DaoResource.prototype, "getResourceById").mockResolvedValue(mockResource);
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      jest.spyOn(fs, "readFileSync").mockReturnValue(Buffer.from("Test file content"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app)
        .get(`/api/originalResources/download/${mockResourceId}`)
        .set("Cookie", ["session=mock-session-cookie"]);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/octet-stream");
      expect(response.headers["content-disposition"]).toContain("attachment");
    });

    test("it should return 404 if the resource file is not found", async () => {
      jest.spyOn(DaoResource.prototype, "getResourceById").mockResolvedValue(mockResource);
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app)
        .get(`/api/originalResources/download/${mockResourceId}`)
        .set("Cookie", ["session=mock-session-cookie"]);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("File not found");
    });

    test("it should return 503 if the database query fails", async () => {
      jest.spyOn(DaoResource.prototype, "getResourceById").mockRejectedValue(new Error("Database error"));
      jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

      const response = await request(app)
        .get(`/api/originalResources/download/${mockResourceId}`)
        .set("Cookie", ["session=mock-session-cookie"]);

      expect(response.status).toBe(503);
      
    });
  });
});
