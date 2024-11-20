import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { Database } from "sqlite3";
import DaoArea from "../../Dao/areaDao.ts";
import { db } from "../../DB/db.ts";

const daoArea = new DaoArea();

jest.mock('sqlite3');

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

describe("DaoArea.modifyGeoreference", () => {

    test("should update document coordinate if coordinate is provided but no old coordinate exists", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(null);
            return {} as Database;
        });

        const id = 1;
        const coordinate = [10, 20];
        const oldCoordinate = null;
        const area = null;
        const oldArea = null;

        await expect(daoArea.modifyGeoreference(id, coordinate, oldCoordinate, area, oldArea)).resolves.toBeUndefined();
        expect(dbRunMock).toHaveBeenCalledWith(
            "UPDATE Document SET Coordinate = ?, Area = NULL WHERE Id = ?",
            [JSON.stringify(coordinate), id],
            expect.any(Function)
        );
    });

    test("should throw an error if database fails during coordinate update", async () => {
        const mockError = "Database error";
        jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });

        const id = 1;
        const coordinate = [10, 20];
        const oldCoordinate = null;
        const area = null;
        const oldArea = null;

        await expect(daoArea.modifyGeoreference(id, coordinate, oldCoordinate, area, oldArea)).rejects.toEqual(mockError);
    });

    test("should update area if area is provided", async () => {
        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(null);
            return {} as Database;
        });

        const id = 1;
        const coordinate = null;
        const oldCoordinate = null;
        const area = [[10, 20], [30, 40]];
        const oldArea = [[5, 15], [25, 35]];

        const getAreaIdSpy = jest.spyOn(daoArea, "getAreaIdByCoordinate").mockResolvedValueOnce(2);

        await expect(daoArea.modifyGeoreference(id, coordinate, oldCoordinate, area, oldArea)).resolves.toBeUndefined();
        expect(getAreaIdSpy).toHaveBeenCalledWith(oldArea);
        expect(dbRunMock).toHaveBeenCalledWith(
            "UPDATE Area SET Vertex = ? WHERE Id = ?",
            [JSON.stringify(area), 2],
            expect.any(Function)
        );
    });

    test("should throw an error if database fails during area update", async () => {
        const mockError = "Database error";
        jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });

        const id = 1;
        const coordinate = null;
        const oldCoordinate = null;
        const area = [[10, 20], [30, 40]];
        const oldArea = [[5, 15], [25, 35]];

        const getAreaIdSpy = jest.spyOn(daoArea, "getAreaIdByCoordinate").mockResolvedValueOnce(2);

        await expect(daoArea.modifyGeoreference(id, coordinate, oldCoordinate, area, oldArea)).rejects.toEqual(mockError);
    });
});
