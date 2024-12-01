import { describe, expect, test } from "@jest/globals";
import { DocumentDescription } from "../../Components/DocumentDescription.ts";

describe("DocumentDescription Class Tests", () => {
    test("should create an instance with all properties and format a valid 'YYYY-MM-DD' date", () => {
        const doc = new DocumentDescription(
            1,
            "Title",
            "Stakeholder",
            "Scale",
            "2023-03-15",
            "Type",
            "English",
            10,
            [50.1, -0.1],
            { id: 1, name: "Area 1" },
            "Description"
        );

        expect(doc.id).toBe(1);
        expect(doc.title).toBe("Title");
        expect(doc.date).toBe("15-03-2023");
        expect(doc.coordinate).toEqual([50.1, -0.1]);
        expect(doc.area).toEqual({ id: 1, name: "Area 1" });
        expect(doc.description).toBe("Description");
    });

    test("should format a valid 'YYYY' date correctly", () => {
        const doc = new DocumentDescription(
            2,
            "Title2",
            "Stakeholder2",
            "Scale2",
            "2022",
            "Type2",
            "French",
            20,
            [40.0, -75.1],
            { id: 2, name: "Area 2" },
            "Description2"
        );

        expect(doc.date).toBe("2022");
    });

    test("should format a valid 'YYYY-MM' date correctly", () => {
        const doc = new DocumentDescription(
            3,
            "Title3",
            "Stakeholder3",
            "Scale3",
            "2022-05",
            "Type3",
            "Spanish",
            30,
            [60.0, -30.1],
            { id: 3, name: "Area 3" },
            "Description3"
        );

        expect(doc.date).toBe("05-2022");
    });

    test("should handle an invalid date format gracefully", () => {
        const doc = new DocumentDescription(
            4,
            "Title4",
            "Stakeholder4",
            "Scale4",
            "Invalid Date",
            "Type4",
            "German",
            40,
            [30.0, -50.1],
            { id: 4, name: "Area 4" },
            "Description4"
        );

        expect(doc.date).toBe("Invalid Date");
    });

    test("should handle a null area", () => {
        const doc = new DocumentDescription(
            5,
            "Title5",
            "Stakeholder5",
            "Scale5",
            "2023-01-01",
            "Type5",
            "English",
            50,
            [20.1, 10.1],
            null,
            "Description5"
        );

        expect(doc.area).toBeNull();
    });
});
