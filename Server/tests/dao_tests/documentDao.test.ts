import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { DocumentDescription } from "../../Components/DocumentDescription.ts";
import { db } from "../../DB/db.ts";
import DaoDocument from "../../Dao/documentDao.ts";

jest.mock("sqlite3");

const daoDocument = new DaoDocument();

afterEach(() => {
  jest.clearAllMocks();
});

describe("DaoDocument Tests", () => {
  describe("newDescription", () => {
    test("should successfully insert a new document", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(null); // Simulate success
      });

      await expect(
        daoDocument.newDescription(
          "Doc1",
          "Stakeholder1",
          "Scale1",
          "2023-01-01",
          "Type1",
          "English",
          1,
          [10, 20],
          1,
          "Description1"
        )
      ).resolves.toBeUndefined();

      expect(db.run).toHaveBeenCalledTimes(1);
      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO Document"),
        [
          "Doc1",
          "Stakeholder1",
          "Scale1",
          "2023-01-01",
          "Type1",
          "English",
          1,
          "[10,20]",
          1,
          "Description1",
        ],
        expect.any(Function)
      );
    });

    test("should throw an error if the database fails", async () => {
      jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error")); // Simulate error
      });

      await expect(
        daoDocument.newDescription(
          "Doc1",
          "Stakeholder1",
          "Scale1",
          "2023-01-01",
          "Type1",
          "English",
          1,
          [10, 20],
          1,
          "Description1"
        )
      ).rejects.toThrow("Database error");

      expect(db.run).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllDoc", () => {
    test("should return all documents", async () => {
      const mockRows = [
        {
          Id: 1,
          Title: "Doc1",
          Stakeholder: "Stakeholder1",
          Scale: "Scale1",
          Date: "2023-01-01",
          Type: "Type1",
          Language: "English",
          Page: 1,
          Coordinate: "[10,20]",
          Vertex: null,
          Description: "Description1",
        },
        {
          Id: 2,
          Title: "Doc2",
          Stakeholder: "Stakeholder2",
          Scale: "Scale2",
          Date: "2023-02-01",
          Type: "Type2",
          Language: "Spanish",
          Page: 2,
          Coordinate: "[30,40]",
          Vertex: "[[10,10],[20,20]]",
          Description: "Description2",
        },
      ];

      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, mockRows);
      });

      const docs = await daoDocument.getAllDoc();
      expect(docs).toEqual(
        mockRows.map(
          (row) =>
            new DocumentDescription(
              row.Id,
              row.Title,
              row.Stakeholder,
              row.Scale,
              row.Date,
              row.Type,
              row.Language,
              row.Page,
              JSON.parse(row.Coordinate),
              row.Vertex ? JSON.parse(row.Vertex) : null,
              row.Description
            )
        )
      );
    });

    test("should throw error on database issues", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"));
      });

      await expect(daoDocument.getAllDoc()).rejects.toThrow("Database error");
    });
  });

  describe("getAllDocOfArea", () => {
    test("should return all documents for a given area ID", async () => {
      const mockRows = [{ Title: "Doc1" }, { Title: "Doc2" }];

      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(null, mockRows);
      });

      const docs = await daoDocument.getAllDocOfArea(1);
      expect(docs).toEqual(mockRows.map((row) => row.Title));

      expect(db.all).toHaveBeenCalledTimes(1);
      expect(db.all).toHaveBeenCalledWith(
        expect.stringContaining("SELECT title"),
        [1],
        expect.any(Function)
      );
    });

    test("should throw error on database issues", async () => {
      jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"));
      });

      await expect(daoDocument.getAllDocOfArea(1)).rejects.toThrow("Database error");

      expect(db.all).toHaveBeenCalledTimes(1);
    });
  });

  describe("getDocumentIdFromTitle", () => {
    test("should return document ID for a given title", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(null, { Id: 1 });
      });

      const id = await daoDocument.getDocumentIdFromTitle("Doc1");
      expect(id).toBe(1);

      expect(db.get).toHaveBeenCalledTimes(1);
      expect(db.get).toHaveBeenCalledWith(
        expect.stringContaining("SELECT Id"),
        ["Doc1"],
        expect.any(Function)
      );
    });

    test("should throw error on database issues", async () => {
      jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
        return callback(new Error("Database error"), null);
      });

      await expect(daoDocument.getDocumentIdFromTitle("Doc1")).rejects.toThrow(
        "Database error"
      );

      expect(db.get).toHaveBeenCalledTimes(1);
    });
  });
});
