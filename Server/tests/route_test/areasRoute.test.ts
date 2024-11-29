import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import DaoArea from "../../Dao/areaDao.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/areaDao");
jest.mock("../../auth");

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/areas", () => {
  test("it should return 200 and all areas", async () => {
    const mockAreas = [
      { id: 1, name: "Area1", vertex: [[10, 20], [30, 40]] },
      { id: 2, name: "Area2", vertex: [[50, 60], [70, 80]] },
    ];

    jest.spyOn(DaoArea.prototype, "getAllAreas").mockResolvedValue(mockAreas);

    const response = await request(app).get("/api/areas");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAreas);
  });

  test("it should return 503 on database error", async () => {
    jest.spyOn(DaoArea.prototype, "getAllAreas").mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/areas");

    expect(response.status).toBe(503);
    
  });
});
