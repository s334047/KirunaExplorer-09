import { Connection } from "../../Components/Connection.ts";
import DaoConnection from "../../Dao/connectionDao.ts";
import { db } from "../../DB/db.ts";
import { Database } from "sqlite3";
import { describe, test, expect, jest, afterEach, } from "@jest/globals";

const daoConnection = new DaoConnection;

jest.mock('sqlite3');

afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
});

describe("Class DaoKX2, function SetDocumentsConnection", () => {

    test("it should return true if the connection between documents is successful", async() => {
        const sourceMock = 'doc1';
        const targetMock = 'doc2';
        const docIds = [1, 2];
        const typeMock = 'tipoConnessione';

        const spySourceId = jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(docIds[0])
        .mockResolvedValueOnce(docIds[1]);
        
        const spyDuplicateDoc = jest.spyOn(daoConnection, "FindDuplicatedDocument")
        .mockResolvedValueOnce(true);

        const dbRunMock = jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(null);
            return {} as Database;
        });

        const result = await daoConnection.SetDocumentsConnection(sourceMock, targetMock, typeMock);
        expect(result).toBe(true);
        expect(dbRunMock).toBeCalledWith(`INSERT INTO Connection (SourceDocId, TargetDocId, Type) VALUES (?, ?, ?)`,
            [docIds[0], docIds[1], typeMock], expect.any(Function));
        expect(spySourceId).toHaveBeenCalledTimes(2);
        expect(spyDuplicateDoc).toHaveBeenCalledTimes(1);
    });

    test("it should return false if the documents exist but there's an error in the db", async() => {
        const sourceMock = 'doc1';
        const targetMock = 'doc2';
        const docIds = [1, 2];
        const typeMock = 'tipoConnessione'; 
        const mockError = 'Database error';

        jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(docIds[0])
        .mockResolvedValueOnce(docIds[1]);
        
        jest.spyOn(daoConnection, "FindDuplicatedDocument")
        .mockResolvedValueOnce(true);

        jest.spyOn(db, "run").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });

        await expect(daoConnection.SetDocumentsConnection(sourceMock, targetMock, typeMock)).rejects.toEqual("DocumentsConnection: "+mockError);
    })

    test("it should return false if there's a duplicate in the db ", async() => {
        //se c'è un duplicato (cioè esiste il contrario) 
        const sourceMock = 'doc1';
        const targetMock = 'doc2';
        const docIds = [1, 2];
        const typeMock = 'tipoConnessione'; 

        jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(docIds[0])
        .mockResolvedValueOnce(docIds[1]);
        
        jest.spyOn(daoConnection, "FindDuplicatedDocument")
        .mockResolvedValueOnce(false);

        await expect(daoConnection.SetDocumentsConnection(sourceMock, targetMock, typeMock)).rejects.toEqual("Duplicate connection on FindDuplicatedDocument\n");
    })

    test("it should return false if one or more documents doesn't exist ", async() => {
        const sourceMock = 'doc1';
        const targetMock = 'doc2';
        const docIds = [1, null];
        const typeMock = 'tipoConnessione'; 

        jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(docIds[0])
        .mockResolvedValueOnce(docIds[1]);

        await expect(daoConnection.SetDocumentsConnection(sourceMock, targetMock, typeMock)).rejects.toEqual("SourceDocId or TargetDocId not found");
    })
})

describe("Class DaoKX2, function GetDocumentConnections", () => {

    test("it should return an array of Connection", async() => {
        const sourceDocMock = 'doc1';
        const sourceDocIdMock = 1;
        const connection1 = new Connection(1,2, "type1");
        const connection2 = new Connection(1,3, "type1");
        const connection3 = new Connection(1,5, "type2");
        const mockConnections = [connection1, connection2, connection3];

        const spySourceDocId = jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(sourceDocIdMock);
    
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
            callback(null, {n : 3});
            return {} as Database;
        });
    
        const result = await daoConnection.GetDocumentConnections(sourceDocMock);
        expect(result).toBe(mockConnections.length);
        expect(dbGetMock).toBeCalledWith(`SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?`,
            [sourceDocIdMock, sourceDocIdMock], expect.any(Function));
        expect(spySourceDocId).toHaveBeenCalledTimes(1);
    });

    test("it should return false if the documents exists but there's an error in the db", async() => {
        const sourceDocMock = 'doc1';
        const sourceDocIdMock = 1;
        const mockError = 'Database error';

        const spySourceDocId = jest.spyOn(daoConnection, "GetDocumentsId")
        .mockResolvedValueOnce(sourceDocIdMock);
    
        const dbGetMock = jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });
    
        await expect(daoConnection.GetDocumentConnections(sourceDocMock)).rejects.toEqual(mockError);
        expect(spySourceDocId).toHaveBeenCalledTimes(1);
        expect(dbGetMock).toBeCalledWith(`SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?`,
            [sourceDocIdMock, sourceDocIdMock], expect.any(Function));
    });

    test("it should return false if the document doesn't exist", async() => {
        const sourceDocMock = 'doc1';
        const sourceDocIdMock = null;

        const spySourceDocId = jest.spyOn(daoConnection, "GetDocumentsId").mockResolvedValueOnce(sourceDocIdMock);
    
        await expect(daoConnection.GetDocumentConnections(sourceDocMock)).rejects.toEqual("SourceDocId not found");
        expect(spySourceDocId).toHaveBeenCalledTimes(1);
    });
})

describe("Class DaoKX2, function GetDocumentsId", () => {
    test("it should return the id associated to a document", async() => {
        const mockTitle = 'Documento';
        const mockId = 1;
        const mockIdDB = {Id : 1};

        const dbGetMock = jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
            callback(null, mockIdDB);
            return {} as Database;
        });

        const res = await daoConnection.GetDocumentsId(mockTitle);
        expect(res).toEqual(mockId);
        expect(dbGetMock).toBeCalledWith(`SELECT Id FROM Document WHERE Title = ?`,
            [mockTitle], expect.any(Function));
    });
    
    test("it should return an error from the database", async() => {
        const mockTitle = 'Documento';
        const mockError = 'Database error';
    
        jest.spyOn(db, "get").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });
    
        await expect(daoConnection.GetDocumentsId(mockTitle)).rejects.toEqual(mockError);
    });
})

describe("Class DaoKX2, function FindDuplicateDocument", () => {
    const mockSourceId = 1;
    const mockTargetId = 2;

    test("it should return FALSE if there's already a connection between two documents", async() => {
        const mockIdDB = [{Id : 7}]

        const dbAllMock = jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
            callback(null, mockIdDB);
            return {} as Database;
        });

        const res = await daoConnection.FindDuplicatedDocument(mockSourceId, mockTargetId);
        expect(res).toEqual(false);
        expect(dbAllMock).toBeCalledWith(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ?`,
            [mockTargetId, mockSourceId], expect.any(Function));
    });

    test("it should return TRUE if there isn't an existing connection between two documents", async() => {
        const mockIdDB = [];

        const dbAllMock = jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
            callback(null, mockIdDB);
            return {} as Database;
        });

        const res = await daoConnection.FindDuplicatedDocument(mockSourceId, mockTargetId);
        expect(res).toEqual(true);
        expect(dbAllMock).toBeCalledWith(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ?`,
            [mockTargetId, mockSourceId], expect.any(Function));
    });
    
    test("it should return an error from the database", async() => {
        const mockError = 'Database error';
    
        jest.spyOn(db, "all").mockImplementation((query, params, callback) => {
            callback(mockError);
            return {} as Database;
        });
    
        await expect(daoConnection.FindDuplicatedDocument(mockSourceId, mockTargetId)).rejects.toEqual(mockError);
    });
    
})