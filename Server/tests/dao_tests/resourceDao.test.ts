import { afterEach, describe, expect, jest, test } from "@jest/globals";
import Resource from "../../Components/Resource.ts";
import { db } from "../../DB/db.ts";
import DaoResource from "../../Dao/resourceDao.ts";

jest.mock("../../DB/db.ts"); // Mock the database module

const daoResource = new DaoResource();

afterEach(() => {
  jest.clearAllMocks();
});

describe("DaoResource Tests", () => {
  const mockResources = [
    new Resource(1, "path/to/resource1.pdf", 101),
    new Resource(2, "path/to/resource2.pdf", 102),
  ];

  describe("addOriginalResource", () => {
    test("should successfully add an original resource", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(daoResource.addOriginalResource("path/to/resource.pdf", 101)).resolves.toBeUndefined();

      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Resource"),
        ["path/to/resource.pdf", 101],
        expect.any(Function)
      );
    });

    test("should throw an error if the database fails", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate database error
      });

      await expect(daoResource.addOriginalResource("path/to/resource.pdf", 101)).rejects.toThrow("Database error");

      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Resource"),
        ["path/to/resource.pdf", 101],
        expect.any(Function)
      );
    });
  });

  describe("getResourcesByDoc", () => {
    test("should return resources for a given document", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, [
          { Id: 1, Path: "path/to/resource1.pdf", DocumentId: 101 },
          { Id: 2, Path: "path/to/resource2.pdf", DocumentId: 102 },
        ]); // Simulate success
      });

      const resources = await daoResource.getResourcesByDoc(101);

      expect(resources).toEqual(mockResources);
      expect(db.all).toHaveBeenCalledTimes(1);
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT Id, Path, DocumentId"),
        [101],
        expect.any(Function)
      );
    });

    test("should throw an error if the database fails", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate database error
      });

      await expect(daoResource.getResourcesByDoc(101)).rejects.toThrow("Database error");

      expect(db.all).toHaveBeenCalledTimes(1);
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT Id, Path, DocumentId"),
        [101],
        expect.any(Function)
      );
    });

    test("should return an empty array if no resources are found", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, []); // Simulate no results
      });

      const resources = await daoResource.getResourcesByDoc(101);

      expect(resources).toEqual([]);
      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("getResourceById", () => {
    test("should return a resource by ID", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, { Id: 1, Path: "path/to/resource1.pdf", DocumentId: 101 });
      });

      const resource = await daoResource.getResourceById(1);

      expect(resource).toEqual(mockResources[0]);
      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining("SELECT Id, Path, DocumentId"),
        [1],
        expect.any(Function)
      );
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate database error
      });

      await expect(daoResource.getResourceById(1)).rejects.toThrow("Database error");

      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining("SELECT Id, Path, DocumentId"),
        [1],
        expect.any(Function)
      );
    });
  });
});


