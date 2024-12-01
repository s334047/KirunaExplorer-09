import { describe, expect, test } from "@jest/globals";
import { Area } from "../../Components/Georeference.ts";

describe("Georeference Tests", () => {
    test("should create an Area instance with correct properties", () => {
        const area = new Area(1, "Test Area", [[10, 20], [30, 40]]);

        expect(area.id).toBe(1);
        expect(area.name).toBe("Test Area");
        expect(area.vertex).toEqual([[10, 20], [30, 40]]);
    });

    test("should handle empty vertices gracefully", () => {
        const area = new Area(2, "Empty Area", []);

        expect(area.vertex).toEqual([]);
    });
});
