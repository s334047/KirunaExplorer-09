import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { db } from "../../DB/db.ts";
import DaoResource from "../../Dao/resourceDao.ts";

jest.mock("../../DB/db.ts");

afterEach(() => {
    jest.clearAllMocks();
});

describe("DaoResource - addOriginalResource", () => {
    const daoResource = new DaoResource();

    test("it should resolve successfully when resource is added", async () => {
        const path = "test/path/resource.pdf";
        const docId = 123;

        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            return callback(null);
        });

        await expect(daoResource.addOriginalResource(path, docId)).resolves.toBeUndefined();

        expect(dbRunMock).toHaveBeenCalledWith(
            `INSERT INTO Resource (Path, DocumentId) VALUES (?, ?)`,
            [path, docId],
            expect.any(Function)
        );
    });

    test("it should reject with an error if the database fails", async () => {
        const path = "test/path/resource.pdf";
        const docId = 123;
        const mockError = new Error("Database error");

        jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            return callback(mockError);
        });

        await expect(daoResource.addOriginalResource(path, docId)).rejects.toThrow("Database error");
    });
});
