import { afterEach, describe, expect, jest, test } from "@jest/globals";
import Resource from "../../Components/Resource.ts";
import { db } from "../../DB/db.ts"; // Mocked database module
import DaoResource from "../../Dao/resourceDao.ts";

jest.mock("../../DB/db.ts"); // Mock database

const daoResource = new DaoResource();

afterEach(() => {
  jest.clearAllMocks();
});

const mockPath = "test/path/resource.pdf";
const mockDocId = 123;
const mockResourceId = 1;
const mockResources = [
  new Resource(mockResourceId, mockPath, mockDocId),
];

describe("DaoResource - Story 7: addOriginalResource", () => {
  test("it should resolve successfully when resource is added", async () => {
    const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
      return callback(null); // Simulate success
    });

    await expect(daoResource.addOriginalResource(mockPath, mockDocId)).resolves.toBeUndefined();

    expect(dbRunMock).toHaveBeenCalledTimes(1);
    expect(dbRunMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Resource"),
      [mockPath, mockDocId],
      expect.any(Function)
    );
  });

  test("it should reject with an error if the database fails", async () => {
    const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
      return callback(new Error("Database error")); // Simulate failure
    });

    await expect(daoResource.addOriginalResource(mockPath, mockDocId)).rejects.toThrow("Database error");

    expect(dbRunMock).toHaveBeenCalledTimes(1);
    expect(dbRunMock).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Resource"),
      [mockPath, mockDocId],
      expect.any(Function)
    );
  });
});

describe("DaoResource - Story 7: getResourcesByDoc", () => {
  test("it should return all resources for a given document", async () => {
    const dbAllMock = jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
      return callback(null, mockResources.map(resource => ({
        Id: resource.id,
        Path: resource.path,
        DocumentId: resource.docId,
      }))); // Simulate success
    });

    const result = await daoResource.getResourcesByDoc(mockDocId);
    expect(result).toEqual(mockResources);

    expect(dbAllMock).toHaveBeenCalledTimes(1);
    expect(dbAllMock).toHaveBeenCalledWith(
      expect.stringContaining("SELECT Id, Path, DocumentId"),
      [mockDocId],
      expect.any(Function)
    );
  });

  test("it should reject with an error if the database query fails", async () => {
    const dbAllMock = jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
      return callback(new Error("Database error"), null); // Simulate failure
    });

    await expect(daoResource.getResourcesByDoc(mockDocId)).rejects.toThrow("Database error");

    expect(dbAllMock).toHaveBeenCalledTimes(1);
    expect(dbAllMock).toHaveBeenCalledWith(
      expect.stringContaining("SELECT Id, Path, DocumentId"),
      [mockDocId],
      expect.any(Function)
    );
  });
});

describe("DaoResource - Story 7: getResourceById", () => {
  test("it should return a resource by ID", async () => {
    const dbGetMock = jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
      return callback(null, {
        Id: mockResourceId,
        Path: mockPath,
        DocumentId: mockDocId,
      }); // Simulate success
    });

    const result = await daoResource.getResourceById(mockResourceId);
    expect(result).toEqual(mockResources[0]);

    expect(dbGetMock).toHaveBeenCalledTimes(1);
    expect(dbGetMock).toHaveBeenCalledWith(
      expect.stringContaining("SELECT Id, Path, DocumentId"),
      [mockResourceId],
      expect.any(Function)
    );
  });

  test("it should reject with an error if the database query fails", async () => {
    const dbGetMock = jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
      return callback(new Error("Database error"), null); // Simulate failure
    });

    await expect(daoResource.getResourceById(mockResourceId)).rejects.toThrow("Database error");

    expect(dbGetMock).toHaveBeenCalledTimes(1);
    expect(dbGetMock).toHaveBeenCalledWith(
      expect.stringContaining("SELECT Id, Path, DocumentId"),
      [mockResourceId],
      expect.any(Function)
    );
  });
});
