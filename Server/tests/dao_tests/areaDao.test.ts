import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { Area } from "../../Components/Georeference.ts";
import { db } from "../../DB/db.ts";
import DaoArea from "../../Dao/areaDao.ts";

jest.mock("sqlite3");

const daoArea = new DaoArea();

afterEach(() => {
  jest.clearAllMocks();
});

  describe("DaoArea Tests - getAllAreas", () => {
    test("should return all areas", async () => {
      const mockRows = [
        { Id: 1, Name: "Area1", Vertex: JSON.stringify([[10, 20], [30, 40]]) },
        { Id: 2, Name: "Area2", Vertex: JSON.stringify([[50, 60], [70, 80]]) },
      ];

      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, mockRows);
      });

      const areas = await daoArea.getAllAreas();
      expect(areas).toEqual([
        new Area(1, "Area1", [[10, 20], [30, 40]]),
        new Area(2, "Area2", [[50, 60], [70, 80]]),
      ]);
    });

    test("should throw error on database issues", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"));
      });

      await expect(daoArea.getAllAreas()).rejects.toThrow("Database error");
    });
  });

  describe("DaoArea Tests - addAreaToDoc", () => {
    test("should successfully add an area to a document", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoArea.addAreaToDoc(1, 101)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO AreaDocLink"),
        [1, 101],
        expect.any(Function)
      );
    });

    test("should throw error on database failure", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate failure
      });

      await expect(daoArea.addAreaToDoc(1, 101)).rejects.toThrow("Database error");
    });
  });

  describe("DaoArea Tests - addArea", () => {
    test("should successfully add a new area", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoArea.addArea("New Area", [[10, 20], [30, 40]])).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Area"),
        ["New Area", JSON.stringify([[10, 20], [30, 40]])],
        expect.any(Function)
      );
    });

    test("should throw error on database failure", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate failure
      });

      await expect(daoArea.addArea("New Area", [[10, 20], [30, 40]])).rejects.toThrow("Database error");
    });
  });

  describe("DaoArea Tests - modifyGeoreference", () => {
    test("should modify coordinates for a document without an old coordinate", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoArea.modifyGeoreference(1, [10, 20], null, null, null, null)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Document SET Coordinate = ?"),
        ["[10,20]", 1],
        expect.any(Function)
      );
    });

    test("should modify coordinates for a document with an old coordinate", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoArea.modifyGeoreference(1, [10, 20], [5, 5], null, null, null)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Document SET Coordinate = ?"),
        ["[10,20]", 1],
        expect.any(Function)
      );
    });

    test("should update area vertex for an existing area", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(
        daoArea.modifyGeoreference(1, null, null, [[10, 20], [30, 40]], [[5, 5], [15, 15]], 1)
      ).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Area SET Vertex = ?"),
        [JSON.stringify([[10, 20], [30, 40]]), 1],
        expect.any(Function)
      );
    });

    test("should update document area to null for a new area", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoArea.modifyGeoreference(1, null, null, { area: true }, null, 1)).resolves.toBeUndefined();
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE Document SET Area = ?,  Coordinate = NULL WHERE Id = ?"),
        [1, 1],
        expect.any(Function)
      );
    });

    test("should throw error on database failure", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate failure
      });

      await expect(daoArea.modifyGeoreference(1, [10, 20], null, null, null, null)).rejects.toThrow(
        "Database error"
      );
    });

    describe('getAreaIdFromName', () => {
      test('should return the correct area ID for a valid name', async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
          return callback(null, { Id: 1 });
        });
        const areaId = await daoArea.getAreaIdFromName('TestArea');
        expect(areaId).toBe(1);
      });
    
      test('should return null if the area does not exist', async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
          return callback(null, null);
        });
        const areaId = await daoArea.getAreaIdFromName('UnknownArea');
        expect(areaId).toBeNull();
      });
    
      test('should throw an error if the database query fails', async () => {
        jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
          return callback(new Error('Database error'));
        });
        await expect(daoArea.getAreaIdFromName('TestArea')).rejects.toThrow('Database error');
      });
    });
    
    describe("getAreaIdByCoordinate", () => {
      test("should return the correct area ID for valid coordinates", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
          return callback(null, { Id: 1 });
        });
    
        const areaId = await daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]]);
        expect(areaId).toBe(1);
        expect(db.get).toHaveBeenCalledWith(
          expect.stringContaining("SELECT Id FROM Area WHERE Vertex = ?"),
          [JSON.stringify([[10, 20], [30, 40]])],
          expect.any(Function)
        );
      });
    
      test("should return null if no area matches the coordinates", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
          return callback(null, null);
        });
    
        const areaId = await daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]]);
        expect(areaId).toBeNull();
      });
    
      test("should throw an error if the database query fails", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
          return callback(new Error("Database error"));
        });
    
        await expect(daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]])).rejects.toThrow(
          "Database error"
        );
      });
    });
  });

describe("DaoArea Tests - Additional Coverage", () => {
  describe("modifyGeoreference", () => {
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
      return callback(new Error("Database error"));
    });

    test("should handle error when updating coordinates without an old coordinate", async () => {
      await expect(daoArea.modifyGeoreference(1, [10, 20], null, null, null, null)).rejects.toThrow(
        "Database error"
      );
    });

    test("should handle error when updating coordinates with an old coordinate", async () => {
      await expect(daoArea.modifyGeoreference(1, [10, 20], [5, 5], null, null, null)).rejects.toThrow(
        "Database error"
      );
    });

    test("should handle error when updating area vertex", async () => {
      await expect(
        daoArea.modifyGeoreference(1, null, null, [[10, 20]], [[5, 5]], 1)
      ).rejects.toThrow("Database error");
    });

    test("should handle error when updating document area to null", async () => {
      await expect(
        daoArea.modifyGeoreference(1, null, null, { area: true }, null, 1)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getAreaIdByCoordinate", () => {
    test("should return the correct area ID for valid coordinates", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, { Id: 1 });
      });

      const areaId = await daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]]);
      expect(areaId).toBe(1);
    });

    test("should return null if the coordinates do not match any area", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, null);
      });

      const areaId = await daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]]);
      expect(areaId).toBeNull();
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"));
      });

      await expect(
        daoArea.getAreaIdByCoordinate([[10, 20], [30, 40]])
      ).rejects.toThrow("Database error");
    });
  });
});
