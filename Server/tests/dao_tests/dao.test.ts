import { Coordinates } from "../../Components/Georeference.ts";
import DaoDocument from "../../Dao/documentDao.ts";
import { db } from "../../DB/db.ts";
import { describe, test, expect, jest, beforeEach, afterEach, } from "@jest/globals";
import { Area } from "../../Components/Georeference.ts";
import DaoArea from "../../Dao/areaDao.ts";


describe("DaoStory1 Test", () => {
    let daoS1: DaoDocument;
    const coordinate = [123, 456];
    const idArea = 4;
    beforeEach(() => {
        daoS1 = new DaoDocument();
        jest.clearAllMocks();
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
                if (params.length !== 10) {
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
            const result = await daoS1.newDescription("Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, coordinate, idArea, "Test Description");
            expect(result).toBe(undefined);
            expect(mockRun).toHaveBeenCalled();
            expect(mockRun).toHaveBeenCalledWith(
                expect.any(String), // SQL query
                ["Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, "[ 123, 456 ]", idArea, "Test Description"],
                expect.any(Function) // Callback function
            );
        });

        test("should handle database errors", async () => {
            const mockRun = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
                callback(new Error("Database error")); // Simulate a database error
                return db;
            });

            await expect(daoS1.newDescription("Test Title", "Test SH", "Test SC", "2023-01-01", "Test Type", "EN", 1, [123, 456], idArea, "Test Description"))
                .rejects.toThrow("Database error");

            expect(mockRun).toHaveBeenCalled();
        });
    });
});
describe("DaoStory3 Test",() =>{
    let daoArea: DaoArea;
    let daoDocument: DaoDocument;

    beforeEach(() => {
        daoArea = new DaoArea();
        daoDocument = new DaoDocument()
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });
    describe("addAreaToDocTest",()=>{
        test("should link the area to the doc",async()=>{
            const mockRun = jest.spyOn(db,"run").mockImplementation((query, params, callback) => {
                callback(null);
                return db;
            });
            const response=await  daoArea.addAreaToDoc(12,12);
            expect(response).toBe(undefined)
            expect(mockRun).toHaveBeenCalled();
        })
        test("should return error",async()=>{
            const mockRun = jest.spyOn(db,"run").mockImplementation((query, params, callback) => {
                callback(new Error("Database Error"));
                return db;
            });
            await expect(daoArea.addAreaToDoc(12,12)).rejects.toThrow('Database Error');;
            expect(mockRun).toHaveBeenCalled();
        })
    })
    describe("addAreaTest",()=>{
        test("should add the area",async()=>{
            const mockRun = jest.spyOn(db,"run").mockImplementation((query, params, callback) => {
                callback(null);
                return db;
            });
            const response=await  daoArea.addArea("Test",[[12,12],[12,12]]);
            expect(response).toBe(undefined)
            expect(mockRun).toHaveBeenCalled();
        })
        test("should return error",async()=>{
            const mockRun = jest.spyOn(db,"run").mockImplementation((query, params, callback) => {
                callback(new Error("Database Error"));
                return db;
            });
            await expect(daoArea.addArea("Test",[[12,12],[12,12]])).rejects.toThrow('Database Error');;
            expect(mockRun).toHaveBeenCalled();
        })
    })
    describe("getAllAreas",()=>{
        test("should get all the areas",async()=>{
            const mockRun = jest.spyOn(db,"all").mockImplementation((query, params, callback) => {
                callback(null,[{Id:12,Name:"Area 1",Vertex:"[[12,12],[13,13]]"},{Id:13,Name:"Area 2",Vertex:"[[14,14],[15,15]]"}]);
                return db;
            });
            const response=await  daoArea.getAllAreas();
            expect(response).toStrictEqual([new Area(12,"Area 1",[[12,12],[13,13]]),new Area(13,"Area 2",[[14,14],[15,15]])])
            expect(mockRun).toHaveBeenCalled();
        })
        test("should return error",async()=>{
            const mockRun = jest.spyOn(db,"all").mockImplementation((query, params, callback) => {
                callback(new Error("Database Error"));
                return db;
            });
            await expect(daoArea.getAllAreas()).rejects.toThrow('Database Error');;
            expect(mockRun).toHaveBeenCalled();
        }) 
    })
    describe("getAreaIdFromName",()=>{
        test("should get id of the area",async()=>{
            const mockRun = jest.spyOn(db,"get").mockImplementation((query, params, callback) => {
                callback(null,{Id:12});
                return db;
            });
            const response=await  daoArea.getAreaIdFromName("Area 1");
            expect(response).toStrictEqual(12)
            expect(mockRun).toHaveBeenCalled();
        })
        test("should return error",async()=>{
            const mockRun = jest.spyOn(db,"get").mockImplementation((query, params, callback) => {
                callback(new Error("Database Error"));
                return db;
            });
            await expect(daoArea.getAreaIdFromName("Area 1")).rejects.toThrow('Database Error');;
            expect(mockRun).toHaveBeenCalled();
        }) 
    })
    describe("getDocumentIdFromTitle",()=>{
        test("should get id of the doc",async()=>{
            const mockRun = jest.spyOn(db,"get").mockImplementation((query, params, callback) => {
                callback(null,{Id:12});
                return db;
            });
            const response=await  daoDocument.getDocumentIdFromTitle("Title 1");
            expect(response).toStrictEqual(12)
            expect(mockRun).toHaveBeenCalled();
        })
        test("should return error",async()=>{
            const mockRun = jest.spyOn(db,"get").mockImplementation((query, params, callback) => {
                callback(new Error("Database Error"));
                return db;
            });
            await expect(daoArea.getAreaIdFromName("Title 1")).rejects.toThrow('Database Error');;
            expect(mockRun).toHaveBeenCalled();
        }) 
    })
})