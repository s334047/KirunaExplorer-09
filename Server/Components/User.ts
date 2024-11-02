export enum UserRole {
    UrbanPlanner = "Urban Planner",
    UrbanDeveloper = "Urban Developer",
    Resident = "Resident"
}

export class User {
    id: number;
    username: string;
    role: UserRole;

    constructor(id: number, username: string, role: UserRole) {
        this.id = id;
        this.username = username;
        this.role = role;
    }
}