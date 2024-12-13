import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { db } from "../../DB/db.ts";
import DaoConnection from "../../Dao/connectionDao.ts";

jest.mock("sqlite3");

const daoConnection = new DaoConnection();

afterEach(() => {
  jest.clearAllMocks();
});

describe("DaoConnection Tests", () => { //1
  describe("DaoConnection Tests - SetDocumentsConnection", () => { //1.1
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

  describe("DaoConnection Tests - GetDocumentConnections", () => { //1.2
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

  describe("DaoConnection Tests - GetDocumentInfoConnections", () => { //1.3
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

  describe("DaoConnection Tests - GetDocumentsId", () => { //1.4
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

  describe("DaoConnection Tests - FindDuplicatedDocument", () => { //1.5
    test("should return false if a duplicate exists in reverse order", async () => {
      jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        // Simulate reverse duplicate found
        if (params[0] === 2 && params[1] === 1) {
          return callback(null, { Id: 1 });
        }
        return callback(null, null); // No direct duplicate
      });
  
      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(false); // Duplicate in reverse order
      expect(db.get).toHaveBeenCalledWith(
        "SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ? AND Type = ?",
        [2, 1, "relation"],
        expect.any(Function)
      );
    });

    test("should return false if a duplicate connection is found in reverse order", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
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

    test("should return false if a duplicate exists in direct order", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        if (params[0] === 1 && params[1] === 2) {
          // Simulate a direct duplicate being found
          return callback(null, { Id: 1 });
        }
        return callback(null, null); // No reverse duplicate
      });
    
      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(false); // Duplicate exists in direct order
      expect(db.get).toHaveBeenCalledWith(
        "SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ? AND Type = ?",
        [1, 2, "relation"],
        expect.any(Function)
      );
    }); //diverso

    test("should return false if a duplicate connection exists in direct order", async () => {
      jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        return callback(null, { Id: 1 }); // Simulate direct duplicate
      });

      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(false);
    }); //diverso

    test("should return true if no duplicate connection is found", async () => {
      jest
        .spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => callback(null, null)) // No reverse duplicate
        .mockImplementationOnce((sql, params, callback) => callback(null, null)); // No direct duplicate

      const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
      expect(result).toBe(true);
    });

    test("should handle database error when checking direct duplicate", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        if (params[0] === 1 && params[1] === 2) {
          return callback(new Error("Database error")); // Simulate error
        }
        return callback(null, null); // No reverse duplicate
      });
    
      await expect(
        daoConnection.FindDuplicatedDocument(1, 2, "relation")
      ).rejects.toThrow("Database error");
    });

    test("should handle database error when checking for direct duplicate", async () => {
      jest
        .spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => callback(null, null)) // No reverse duplicate
        .mockImplementationOnce((sql, params, callback) =>
          callback(new Error("Database error"))
        ); // Simulate failure for direct duplicate

      await expect(
        daoConnection.FindDuplicatedDocument(1, 2, "relation")
      ).rejects.toThrow("Database error");
    });

    test("should handle database error when checking for reverse duplicate", async () => {
      jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate failure
      });

      await expect(
        daoConnection.FindDuplicatedDocument(1, 2, "relation")
      ).rejects.toThrow("Database error");
    });

    test("should throw an error if the database query fails when checking reverse duplicate", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(daoConnection.FindDuplicatedDocument(1, 2, "relation")).rejects.toThrow("Database error");
    });

    test("should throw an error if the database query fails when checking direct duplicate", async () => {
      jest
        .spyOn(db, "get")
        .mockImplementationOnce((sql, params, callback) => callback(null, null)) // No reverse duplicate
        .mockImplementationOnce((sql, params, callback) => callback(new Error("Database error"), null)); // Direct duplicate query fails

      await expect(daoConnection.FindDuplicatedDocument(1, 2, "relation")).rejects.toThrow("Database error");
    });

    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null); // Simulate failure
      });

      await expect(
        daoConnection.FindDuplicatedDocument(1, 2, "relation")
      ).rejects.toThrow("Database error");
    });
  }); //QUI OK da rivedere

  describe("DaoConnection Tests - GetConnections", () => { //1.6
    test("should return all connections", async () => {
      const mockConnections = [
        { SourceDocId: 1, TargetDocId: 2, Type: "relation" },
        { SourceDocId: 2, TargetDocId: 3, Type: "dependency" },
      ];
  
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        if (typeof params === "function") {
          // Handle cases where params might be omitted, and the callback is in the params slot
          callback = params;
        }
        return callback(null, mockConnections); // Simulate success
      });
  
      const result = await daoConnection.GetConnections();
      expect(result).toEqual(mockConnections);
      expect(db.all).toHaveBeenCalledWith(
        "SELECT SourceDocId as source, TargetDocId as target, Type as type FROM Connection",
        expect.any(Function)
      );
    });
  
    test("should throw an error if the database query fails", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        if (typeof params === "function") {
          // Handle cases where params might be omitted, and the callback is in the params slot
          callback = params;
        }
        return callback(new Error("Database error")); // Simulate failure
      });
  
      await expect(daoConnection.GetConnections()).rejects.toThrow("Database error");
    });
  });
});

describe("FindDuplicatedDocument - Additional Edge Cases", () => {
  test("should return false if a duplicate connection exists in reverse order", async () => {
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
      if (params[0] === 2 && params[1] === 1) {
        return callback(null, { Id: 1 }); // Simulate reverse duplicate found
      }
      return callback(null, null); // No direct duplicate
    });

    const result = await daoConnection.FindDuplicatedDocument(1, 2, "relation");
    expect(result).toBe(false);
  });

  test("should throw an error if the database query fails when checking reverse duplicate", async () => {
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
      if (params[0] === 2 && params[1] === 1) {
        return callback(new Error("Database error")); // Simulate error
      }
      return callback(null, null); // No direct duplicate
    });

    await expect(
      daoConnection.FindDuplicatedDocument(1, 2, "relation")
    ).rejects.toThrow("Database error");
  });

  test("should throw an error if the database query fails when checking direct duplicate", async () => {
    jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
      if (params[0] === 1 && params[1] === 2) {
        return callback(new Error("Database error")); // Simulate error
      }
      return callback(null, null); // No reverse duplicate
    });

    await expect(
      daoConnection.FindDuplicatedDocument(1, 2, "relation")
    ).rejects.toThrow("Database error");
  });
});

describe("SetDocumentsConnection - Edge Cases", () => {
  test("should handle inserting a connection with unexpected database error", async () => {
    jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
      return callback(new Error("Unexpected error")); // Simulate unexpected error
    });
  
    await expect(
      daoConnection.SetDocumentsConnection(1, 2, "relation")
    ).rejects.toThrow("DocumentsConnection: Database error");
  });
});  

describe("GetConnections - Additional Edge Cases", () => {
  test("should handle empty connections table gracefully", async () => {
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
      if (typeof params === "function") {
        callback = params;
      }
      return callback(null, []); // Simulate empty table
    });
  
    const result = await daoConnection.GetConnections();
    expect(result).toEqual([]);
    expect(db.all).toHaveBeenCalledWith(
      "SELECT SourceDocId as source, TargetDocId as target, Type as type FROM Connection",
      expect.any(Function)
    );
  });
  
  test("should throw an error if connections table query fails", async () => {
    jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
      if (typeof params === "function") {
        callback = params;
      }
      return callback(new Error("Database error")); // Simulate error
    });
  
    await expect(daoConnection.GetConnections()).rejects.toThrow("Database error");
  });
});

