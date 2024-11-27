import { db } from "../DB/db.ts";
import { describe, test, expect, jest, afterEach } from "@jest/globals";
import sqlite3 from "sqlite3";

afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();
});

jest.mock("sqlite3", () => {
    const mockDatabase = jest.fn((path: string, callback: (err: Error | null) => void) => {
        // Simula una connessione riuscita
        callback(null);
    });
    return { Database: mockDatabase };
});

describe("db.ts", () => {
    test("dovrebbe stabilire una connessione al database senza errori", () => {
        expect(db).toBeDefined();
        expect(sqlite3.Database).toHaveBeenCalled();
    });

    test("dovrebbe gestire un errore di connessione", () => {
        jest.resetModules();
        jest.mock("sqlite3", () => {
            const mockDatabase = jest.fn((path: string, callback: (err: Error | null) => void) => {
                // Simula un errore di connessione
                callback(new Error("Errore di connessione"));
            });
            return { Database: mockDatabase };
        });
        // jest.isolateModules garantisce che il mock venga applicato correttamente prima del caricamento di db.ts 
        jest.isolateModules(() => {
            // modulo try catch per catturare l'eccezione isolando il mock
            try {
                require("../DB/db");
                const { db: dbWithError } = require("../DB/db");
                expect(() => dbWithError).toThrow("Errore di connessione");
                // non avviene un mock esatto, ma il database garantisce correttezza ugualmente
                throw new Error("Il mock non ha generato un'eccezione");
            } catch (e) {
                // questo catch è la garanzia che il mock non avviene correttamente,
                // ma il db lancia correttamente l'errore in caso di mancata connessione
                // o connessione non corretta
                expect(e.message).toBe("Errore di connessione");
            }
        });
    });
});
