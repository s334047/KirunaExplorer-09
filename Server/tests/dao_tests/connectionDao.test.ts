import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { db } from "../../DB/db.ts";
import DaoConnection from "../../Dao/connectionDao.ts";

jest.mock("sqlite3");

const daoConnection = new DaoConnection();

afterEach(() => {
  jest.clearAllMocks();
});

describe("DaoConnection Tests", () => {
  describe("SetDocumentsConnection", () => {
    test("should successfully insert connection", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      const result = await daoConnection.SetDocumentsConnection(1, 2, "relation");
      expect(result).toBe(true);
      expect(db.run).toHaveBeenCalledWith(
        "INSERT INTO Connection (SourceDocId, TargetDocId, Type) VALUES (?, ?, ?)",
        [1, 2, "relation"],
        expect.any(Function)
      );
    });

    test("should throw error if database fails", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate failure
      });

      await expect(daoConnection.SetDocumentsConnection(1, 2, "relation")).rejects.toThrow("Database error");
    });
  });

  describe("GetDocumentConnections", () => {
    test("should return the number of connections for a given document", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, { n: 5 }); // Simulate success
      });

      const result = await daoConnection.GetDocumentConnections(1);
      expect(result).toBe(5);
      expect(db.get).toHaveBeenCalledWith(
        "SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?",
        [1, 1],
        expect.any(Function)
      );
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(daoConnection.GetDocumentConnections(1)).rejects.toThrow("Database error");
    });
  });

  describe("GetDocumentInfoConnections", () => {
    test("should return connection details for a given document", async () => {
      const mockRows = [
        { id: 2, title: "Doc2", type: "relation" },
        { id: 3, title: "Doc3", type: "relation" },
      ];

      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, mockRows); // Simulate success
      });

      const result = await daoConnection.GetDocumentInfoConnections(1);
      expect(result).toEqual(mockRows);
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT"),
        [1, 1, 1],
        expect.any(Function)
      );
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(daoConnection.GetDocumentInfoConnections(1)).rejects.toThrow("Database error");
    });
  });

  describe("GetDocumentsId", () => {
    test("should return the document ID for a given title", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, { Id: 1 }); // Simulate success
      });

      const result = await daoConnection.GetDocumentsId("Doc1");
      expect(result).toBe(1);
      expect(db.get).toHaveBeenCalledWith(
        "SELECT Id FROM Document WHERE Title = ?",
        ["Doc1"],
        expect.any(Function)
      );
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(daoConnection.GetDocumentsId("Doc1")).rejects.toThrow("Database error");
    });
  });

  describe("FindDuplicatedDocument", () => {
    test("should return false if a duplicate connection is found", async () => {
      jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        return callback(null, { Id: 1 }); // Simulate duplicate found for reversed Source-Target
      });

      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(false);
      expect(db.get).toHaveBeenCalledWith(
        "SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ? AND Type = ?",
        [2, 1, "relation"],
        expect.any(Function)
      );
    });

    test("should return true if no duplicate connection is found", async () => {
      jest
        .spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => callback(null, null)) // No reverse duplicate
        .mockImplementationOnce((sql, params, callback) => callback(null, null)); // No direct duplicate

      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(true);
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(
        daoConnection.FindDuplicatedDocument(1, 2, "relation")
      ).rejects.toThrow("Database error");
    });
  });
});
