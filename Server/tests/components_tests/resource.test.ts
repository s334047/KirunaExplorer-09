import { describe, expect, test } from "@jest/globals";
import Resource from "../../Components/Resource.ts";

describe("Resource Tests", () => {
    test("should create a Resource instance with correct properties", () => {
        const resource = new Resource(1, "path/to/file.pdf", 101);

        expect(resource.id).toBe(1);
        expect(resource.path).toBe("path/to/file.pdf");
        expect(resource.docId).toBe(101);
    });

    test("should handle invalid inputs gracefully", () => {
        const resource = new Resource(null, "", null);

        expect(resource.id).toBeNull();
        expect(resource.path).toBe("");
        expect(resource.docId).toBeNull();
    });
});
