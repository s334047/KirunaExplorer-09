import { afterEach, describe, expect, jest, test } from "@jest/globals";
import request from "supertest";
import { DocumentDescription } from "../../Components/DocumentDescription.ts"; // Ensure the path is correct
import DaoDocument from "../../Dao/documentDao.ts";
import { app } from "../../index.ts";

jest.mock("../../Dao/documentDao");

afterEach(() => {
    jest.clearAllMocks();
});

describe("GET /api/documents", () => {
    test("it should return all documents successfully", async () => {
        // Create mock documents that match the `DocumentDescription` type
        const mockDocs: DocumentDescription[] = [
            {
                id: 1,
                title: "Document 1",
                stakeholder: "Stakeholder 1",
                scale: "Scale 1",
                date: "2023-01-01",
                type: "Type 1",
                language: "en",
                page: 10,
                coordinate: [10, 20],
                area: [[1, 1], [2, 2]],
                description: "Description 1",
            },
            {
                id: 2,
                title: "Document 2",
                stakeholder: "Stakeholder 2",
                scale: "Scale 2",
                date: "2023-02-01",
                type: "Type 2",
                language: "fr",
                page: 15,
                coordinate: null,
                area: null,
                description: "Description 2",
            },
        ];

        // Mock the DAO method to return the mockDocs
        jest.spyOn(DaoDocument.prototype, "getAllDoc").mockResolvedValue(mockDocs);

        // Make the request
        const response = await request(app).get("/api/documents");

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDocs);
    });

    test("it should return 503 if the DAO fails", async () => {
        
        jest.spyOn(DaoDocument.prototype, "getAllDoc").mockRejectedValue("Database error");
    
        
        const response = await request(app).get("/api/documents");
    
       
        expect(response.status).toBe(503); 
    });
    
    
    
});
