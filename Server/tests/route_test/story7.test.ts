import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { db } from "../../DB/db.ts"; // Mocked database module
import DaoResource from "../../Dao/resourceDao.ts";

jest.mock("../../DB/db.ts"); // Mock database

const daoResource = new DaoResource();

afterEach(() => {
    jest.clearAllMocks();
});

describe("DaoResource - addOriginalResource", () => {
    const path = "test/path/resource.pdf";
    const docId = 123;

    test("it should resolve successfully when resource is added", async () => {
        // Mock db.run to simulate successful execution
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            return callback(null); // Simulate success
        });

        await expect(daoResource.addOriginalResource(path, docId)).resolves.toBeUndefined();

        // Validate db.run was called
        expect(dbRunMock).toHaveBeenCalledTimes(1);

        // Validate the query and parameters used
        const [calledQuery, calledParams, calledCallback] = dbRunMock.mock.calls[0];
        expect(calledQuery).toContain("INSERT INTO Resource");
        expect(calledParams).toEqual([path, docId]);
        expect(typeof calledCallback).toBe("function");
    });

    test("it should reject with an error if the database fails", async () => {
        // Mock db.run to simulate an error
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            return callback(new Error("Database error")); // Simulate failure
        });

        await expect(daoResource.addOriginalResource(path, docId)).rejects.toThrow("Database error");

        // Validate db.run was called
        expect(dbRunMock).toHaveBeenCalledTimes(1);

        // Validate the query and parameters used
        const [calledQuery, calledParams, calledCallback] = dbRunMock.mock.calls[0];
        expect(calledQuery).toContain("INSERT INTO Resource");
        expect(calledParams).toEqual([path, docId]);
        expect(typeof calledCallback).toBe("function");
    });
});
