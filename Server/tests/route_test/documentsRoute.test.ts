import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoDocument from "../../Dao/documentDao.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/documentDao");
jest.mock("../../auth");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/documents", () => {
  test("it should return 200 and all documents", async () => {
    const mockDocuments = [
      { id: 1, title: "Document1", stakeholder: "Stakeholder1", type: "Type1" },
      { id: 2, title: "Document2", stakeholder: "Stakeholder2", type: "Type2" },
    ];

    jest.spyOn(DaoDocument.prototype, "getAllDoc").mockResolvedValue(mockDocuments as any);

    const response = await request(app).get("/api/documents");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDocuments);
  });

  test("it should return 503 on database error", async () => {
    jest.spyOn(DaoDocument.prototype, "getAllDoc").mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/documents");

    expect(response.status).toBe(503);
    
  });
});
