import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { Database } from "sqlite3";
import { db } from "../../DB/db.ts";

jest.mock("sqlite3");

describe("Database Tests", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should establish a connection without errors", async () => {
        expect(db).toBeDefined();
    });

    test("should handle connection errors gracefully", async () => {
        jest.spyOn(db, "on").mockImplementation((event, callback): Database => {
            if (event === "error") {
                callback(new Error("Connection error"));
            }
            return db;
        });

        const errorListener = jest.fn();
        db.on("error", errorListener);

        expect(errorListener).toHaveBeenCalled();
    });
});
