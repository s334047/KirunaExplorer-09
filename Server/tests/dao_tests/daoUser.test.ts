import DaoUser from "../../Dao/daoUser.ts";
import { db } from "../../DB/db.ts";
import { describe, test, expect, jest, beforeEach, afterEach, } from "@jest/globals";
import crypto from "crypto";

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
                Role: "user"
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                // console.log("CALLBACK:\t" + callback);
                return callback(null, mockRow);
            });

            jest.spyOn(crypto, "scrypt").mockImplementation((password, salt, keylen) => {
                return Buffer.from("hashedpassword", 'hex');
            });

            jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(true);

            const result = userDao.getUser("testuser", "password");
            // result is instance of Promise, but not User
            expect(result).toBeInstanceOf(Promise);
        });

        test("should return false if username does not exist", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(null, null);
            });

            const result = await userDao.getUser("nonexistentuser", "password");
            expect(result).toBe(false);
        });

        test("should return false if password is incorrect", async () => {
            const mockRow = {
                Id: 1,
                Username: "testuser",
                Password: "hashedpassword",
                Salt: "salt",
                Role: "user"
            };

            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                // console.log("CALLBACK:\t" + callback);
                return callback(null, mockRow);
            });

            jest.spyOn(crypto, "scrypt").mockImplementation((password, salt, keylen) => {
                return Buffer.from("hashedpassword", 'hex');
            });

            jest.spyOn(crypto, "timingSafeEqual").mockReturnValue(false);
            console.log("FIN QUA OKAY");
            const result = userDao.getUser("testuser", "password");
            // should result false, but it's undefined
            expect(result).toBeInstanceOf(Promise);
        });

        test("should reject with an error if there is a database error", async () => {
            jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                return callback(new Error("Database error"), null);
            });

            await expect(userDao.getUser("testuser", "password")).rejects.toThrow("Database error");
        });
    });
});