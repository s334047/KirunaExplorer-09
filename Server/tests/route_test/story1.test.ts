import { describe, test, expect, jest, beforeEach, afterEach, } from "@jest/globals";
import request from "supertest";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";
require('dotenv').config();

jest.mock("../../auth");

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

describe('POST /api/sessions', () => {
    const mockUser = { 
        username: process.env.MOCK_USERNAME, 
        password: process.env.MOCK_PASSWORD
        };

    test("it should return 200 if login is successful", async () => {
        jest.spyOn(Authenticator.prototype, "login").mockImplementation((req, res) => {
            return res.status(200).json({ id: 1, username: mockUser.username });
        });

        const response = await request(app).post("/api/sessions").send(mockUser);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe(mockUser.username);
    });

    test("it should return 401 if login fails", async () => {
        jest.spyOn(Authenticator.prototype, "login").mockImplementation((req, res) => {
            return res.status(401).json({ error: "Authentication failed" });
        });

        const response = await request(app).post("/api/sessions").send(mockUser);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Authentication failed");
    });
});
