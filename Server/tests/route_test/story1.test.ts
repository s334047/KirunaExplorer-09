import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import Authenticator from "../../auth.ts";
import { app } from "../../index.ts";

jest.mock("../../auth");

afterEach(() => {
    jest.clearAllMocks();
});

describe('POST /api/sessions', () => {
    const mockUser = { username: "user1", password: "password1" };

    test("it should return 200 if login is successful", async () => {
        jest.spyOn(Authenticator.prototype, "login").mockImplementation((req, res) => {
            return res.status(200).json({ id: 1, username: "user1" });
        });

        const response = await request(app).post("/api/sessions").send(mockUser);

        expect(response.status).toBe(200);
        expect(response.body.username).toBe("user1");
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