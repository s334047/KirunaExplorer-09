import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import crypto from "crypto";
import DaoUser from "../../Dao/daoUser.ts";
import { db } from "../../DB/db.ts";

jest.mock("sqlite3");
jest.mock("crypto");

describe("UserDao", () => {
    let userDao: DaoUser;

    beforeEach(() => {
        userDao = new DaoUser();
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
        jest.spyOn(db, "get").mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    describe("getUser", () => {
        test("should return a user object if username and password are correct", async () => {
            const mockRow = {
                Id: 1,
                Username: "testuser",
                Password: "hashedpassword",
                Salt: "salt",
                Role: "user",
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, mockRow);
            });

            jest.spyOn(crypto, "scrypt").mockImplementation((password, salt, keylen, callback) => {
                (callback as any)(null, Buffer.from("hashedpassword", "hex"));
            });

            jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(true);

            const result = await userDao.getUser("testuser", "password");
            expect(result).toEqual(expect.objectContaining({ username: "testuser", role: "user" }));
        });

        test("should return false if username does not exist", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });

            const result = await userDao.getUser("nonexistentuser", "password");
            expect(result).toBe(false);
        });

        test("should return false if salt is not present in the database", async () => {
            const mockRow = {
                Id: 1,
                Username: "testuser",
                Password: "hashedpassword",
                Salt: null,
                Role: "user",
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, mockRow);
            });

            const result = await userDao.getUser("testuser", "password");
            expect(result).toBe(false);
        });

        test("should return false if password is incorrect", async () => {
            const mockRow = {
                Id: 1,
                Username: "testuser",
                Password: "hashedpassword",
                Salt: "salt",
                Role: "user",
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, mockRow);
            });

            jest.spyOn(crypto, "scrypt").mockImplementation((password, salt, keylen, callback) => {
                (callback as any)(null, Buffer.from("differenthashedpassword", "hex"));
            });

            jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(false);

            const result = await userDao.getUser("testuser", "password");
            expect(result).toBe(false);
        });

        test("should handle error during crypto.scrypt", async () => {
            const mockRow = {
                Id: 1,
                Username: "testuser",
                Password: "hashedpassword",
                Salt: "salt",
                Role: "user",
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, mockRow);
            });

            jest.spyOn(crypto, "scrypt").mockImplementation((password, salt, keylen, callback) => {
                (callback as any)(new Error("Crypto error"), null);
            });

            await expect(userDao.getUser("testuser", "password")).rejects.toThrow("Crypto error");
        });

        test("should reject with an error if there is a database error", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(new Error("Database error"), null);
            });

            await expect(userDao.getUser("testuser", "password")).rejects.toThrow("Database error");
        });
    });
});
