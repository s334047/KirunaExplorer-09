import { describe, expect, test } from "@jest/globals";
import { User, UserRole } from "../../Components/User.ts";

describe("User Class Tests", () => {
    test("should create a User instance with correct properties", () => {
        const user = new User(1, "testuser", UserRole.UrbanPlanner);

        expect(user.id).toBe(1);
        expect(user.username).toBe("testuser");
        expect(user.role).toBe(UserRole.UrbanPlanner);
    });

    test("should handle UserRole as 'UrbanDeveloper'", () => {
        const user = new User(2, "developer", UserRole.UrbanDeveloper);

        expect(user.id).toBe(2);
        expect(user.username).toBe("developer");
        expect(user.role).toBe(UserRole.UrbanDeveloper);
    });

    test("should handle UserRole as 'Resident'", () => {
        const user = new User(3, "resident", UserRole.Resident);

        expect(user.id).toBe(3);
        expect(user.username).toBe("resident");
        expect(user.role).toBe(UserRole.Resident);
    });
});
