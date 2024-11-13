import DaoDocument from "../../Dao/documentDao.ts";
import { DocumentDescription } from "../../Components/DocumentDescription.ts";
import {jest, describe, afterEach, test, expect} from "@jest/globals";
import { Database } from "sqlite3";
import { db } from "../../DB/db.ts";

jest.mock("sqlite3");

describe("daoStory4", () => {
    const dao = new DaoDocument();

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });

    describe("getAllDoc", () => {
        test("It should return an array of DocumentDescription", async () => {
            const mockRows = [
                { Id: 1, Title: "Doc 1", Stakeholder: "Stakeholder 1", Scale: "Scale 1", Date: "2024-01-01", Type: "Type 1", Language: "English", Page: 1, Coordinate: JSON.stringify([1, 2]), Description: "Description 1" },
                { Id: 2, Title: "Doc 2", Stakeholder: "Stakeholder 2", Scale: "Scale 2", Date: "2024-01-02", Type: "Type 2", Language: "Italian", Page: 2 , Coordinate: null, Description: "Description 2" }
            ];

            jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
                callback(null, mockRows);
                return {} as Database;
            });

            const result = await dao.getAllDoc();
            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(DocumentDescription);
            expect(result[0].title).toEqual("Doc 1");
            expect(result[1].title).toEqual("Doc 2");
        });
        test("It should reject with an error if the query fails", async () => {
            const mockError = new Error("Database Error");
            jest.spyOn(db,"all").mockImplementation((query, params, callback) => {
                callback(mockError);
                return {} as Database;
            });

            await expect(dao.getAllDoc()).rejects.toThrow("Database Error");
            
        });
    });

    describe("getAllDocOfArea", () => {
        test("It should return an array of document titles for a given area", async () => {
            const mockRows = [
                { Title: "Doc 1" },
                { Title: "Doc 2" },
                { Title: "Doc 4" } ,
            ];

            jest.spyOn(db,"all").mockImplementation((query, params, callback) => {
                callback(null, mockRows);
                return {} as Database;
            });

            const result = await dao.getAllDocOfArea(1);
            expect(result).toHaveLength(3);
            expect(result).toEqual(["Doc 1", "Doc 2", "Doc 4"]);
        });

        test("It should reject with an error if the query fails", async () => {
            const mockError = new Error("Database error");
            jest.spyOn(db,"all").mockImplementation((query, params, callback) => {
                callback(mockError);
                return {} as Database;
            });
            await expect(dao.getAllDocOfArea(1)).rejects.toThrow("Database error");
        });
    });
});
