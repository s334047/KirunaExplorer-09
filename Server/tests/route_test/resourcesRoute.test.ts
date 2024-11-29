import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoResource from "../../Dao/resourceDao.ts";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/resourceDao");
jest.mock("../../auth");

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/originalResources", () => {
  const mockFile = Buffer.from("This is a test file.");
  const mockDocId = 123;

  test("it should return 200 on successful upload", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
    jest.spyOn(DaoResource.prototype, "addOriginalResource").mockResolvedValue(undefined);

    const response = await request(app)
      .post("/api/originalResources")
      .field("docId", mockDocId.toString())
      .attach("file", mockFile, "testfile.pdf");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("File update successfully");
  });

  test("it should return 400 if no file is provided", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());

    const response = await request(app).post("/api/originalResources").field("docId", mockDocId.toString());

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("No file updated");
  });

  test("it should return 503 on database error", async () => {
    jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => next());
    jest.spyOn(DaoResource.prototype, "addOriginalResource").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/api/originalResources")
      .field("docId", mockDocId.toString())
      .attach("file", mockFile, "testfile.pdf");

    expect(response.status).toBe(503);
  });
});
