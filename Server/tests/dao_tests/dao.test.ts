import { Coordinates } from "../../Components/Georeference.ts";
import Dao from "../../Dao/daoStory1-3.ts";
import { db } from "../../DB/db.ts";
import { describe, test, expect, jest, beforeEach, afterEach, } from "@jest/globals";


// database mock
jest.mock("../../DB/db.ts", () => ({
    db: {
        run: jest.fn(),
    },
}));

describe("DaoStory1 Test", () => {
    let daoS1: Dao;
    // let mockUser: User;

    beforeEach(() => {
        daoS1 = new Dao();
        // const user = new User("TestUser", "TestPassword", "TestEmail", "TestName", "TestSurname", "TestRole");
        // mockUser = user;
        jest.clearAllMocks();
        // jest.restoreAllMocks();
        // jest.resetAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    describe("DaoStory1 newDescription", () => {
        test("should insert a new description into the Document table", async () => {
            const mockRun = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
                // checking parameters
                if (params.length !== 9) {
                    throw new Error("Wrong number of parameters in DaoStory1 newDescription");
                } else if (typeof callback !== "function") {
                    throw new Error("Callback is not a function in DaoStory1 newDescription");
                }
                else if (query.includes("INSERT INTO Document (Title, Stakeholder, Scale, Date, Type, Language, Page, Coordinate, Description)VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
                    throw new Error("Wrong query in DaoStory1 newDescription");
                }
                callback(null); // Simulate a successful insertion
                return db;
            });
            const result = await daoS1.newDescription("Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, new Coordinates(123, 456), "Test Description");
            expect(result).toBe(undefined);

            await expect(daoS1.newDescription("Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, new Coordinates(123, 456), "Test Description"))
                .resolves.not.toThrow();

            expect(mockRun).toHaveBeenCalledWith(
                expect.any(String), // SQL query
                ["Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, '[ 123, 456 ]', "Test Description"],
                expect.any(Function) // Callback function
            );
        });

        test("should handle database errors", async () => {
            const mockRun = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
                callback(new Error("Database error")); // Simulate a database error
                return db;
            });

            await expect(daoS1.newDescription("Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, new Coordinates(123, 456), "Test Description"))
                .rejects.toThrow("Database error");

            expect(mockRun).toHaveBeenCalled();
        });
    });
});