import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../auth");

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/sessions", () => {
  const mockUser = { username: process.env.MOCK_USERNAME, password: process.env.MOCK_PASSWORD };

  test("should return 200 for successful login", async () => {
    jest.spyOn(Authenticator.prototype, "login").mockImplementation((req, res) => {
      return res.status(200).json({ id: 1, username: mockUser.username });
    });

    const response = await request(app).post("/api/sessions").send(mockUser);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe(mockUser.username);
  });

  test("should return 401 for authentication failure", async () => {
    jest.spyOn(Authenticator.prototype, "login").mockImplementation((req, res) => {
      return res.status(401).json({ error: "Authentication failed" });
    });

    const response = await request(app).post("/api/sessions").send(mockUser);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication failed");
  });
});
