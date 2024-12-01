import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import passport from "passport";
import Authenticator from "../../auth.ts";

jest.mock("passport");

interface RequestMock {
    logout: (callback: (err: any) => void) => void;
    login: (user: any, callback: (err: any) => void) => void;
    isAuthenticated: () => boolean;
}

describe("Authenticator Tests", () => {
    let mockApp: any;
    let auth: Authenticator;

    beforeEach(() => {
        mockApp = {
            use: jest.fn(),
        };
        auth = new Authenticator(mockApp);
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("should initialize session and passport", () => {
        auth.initAuth();

        expect(mockApp.use).toHaveBeenCalledTimes(3);
        expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Session middleware
        expect(mockApp.use).toHaveBeenCalledWith(passport.initialize());
        expect(mockApp.use).toHaveBeenCalledWith(passport.session());
    });

    test("should handle session initialization errors", () => {
        const sessionMiddleware = jest.fn().mockImplementation(() => {
            throw new Error("Session init error");
        });
        mockApp.use = sessionMiddleware;

        try {
            auth.initAuth();
        } catch (error) {
            expect(error.message).toBe("Session init error");
        }
    });

    test("should authenticate user successfully", async () => {
        const reqMock: { login: jest.Mock } = {
            login: jest.fn().mockImplementation((user: any, callback: (err: any) => void) => callback(null)),
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const nextMock = jest.fn();

        const userMock = { id: 1, username: "testuser" };

        jest.spyOn(passport, "authenticate").mockImplementation(
            () => (req, res, next) => {
                const callback = (err, user, info) => {
                    if (err || !user) return next(err || new Error("Authentication failed"));
                    req.login(user, (loginErr) => {
                        if (loginErr) return next(loginErr);
                        res.status(200).json(user);
                    });
                };
                callback(null, userMock, null);
            }
        );

        await auth.login(reqMock, resMock, nextMock);

        expect(reqMock.login).toHaveBeenCalledWith(userMock, expect.any(Function));
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith(userMock);
    });

    test("should handle login failure due to req.login error", async () => {
        const reqMock: { login: jest.Mock } = {
            login: jest.fn().mockImplementation((user: any, callback: (err: any) => void) => callback(new Error("Login error"))),
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const nextMock = jest.fn();

        const userMock = { id: 1, username: "testuser" };

        jest.spyOn(passport, "authenticate").mockImplementation(
            () => (req, res, next) => {
                const callback = (err, user, info) => {
                    if (err || !user) return next(err || new Error("Authentication failed"));
                    req.login(user, (loginErr) => {
                        if (loginErr) return next(loginErr);
                        res.status(200).json(user);
                    });
                };
                callback(null, userMock, null);
            }
        );

        await auth.login(reqMock, resMock, nextMock);

        expect(nextMock).toHaveBeenCalledWith(new Error("Login error"));
    });

    test("should return 401 if authentication fails", async () => {
        const reqMock = { login: jest.fn() } as any;
        const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const nextMock = jest.fn();

        jest.spyOn(passport, "authenticate").mockImplementation(
            () => (req, res, next) => {
                const callback = (err, user, info) => {
                    res.status(401).json({ error: "Authentication failed" });
                };
                callback(null, null, new Error("Authentication failed"));
            }
        );

        await auth.login(reqMock, resMock, nextMock);

        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Authentication failed" });
    });

    test("should log out user successfully", async () => {
        const reqMock: RequestMock = {
            logout: jest.fn((callback: (err: any) => void) => callback(null)),
            login: jest.fn(),
            isAuthenticated: jest.fn().mockReturnValue(false) as () => boolean,
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            end: jest.fn(),
        } as any;

        await auth.logout(reqMock, resMock, jest.fn());

        expect(reqMock.logout).toHaveBeenCalledWith(expect.any(Function));
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.end).toHaveBeenCalled();
    });

    test("should handle error during logout", async () => {
        const reqMock: RequestMock = {
            logout: jest.fn((callback: (err: any) => void) => callback(new Error("Logout error"))),
            login: jest.fn(),
            isAuthenticated: jest.fn(() => false),
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            end: jest.fn(),
        } as any;

        const nextMock = jest.fn();

        await auth.logout(reqMock, resMock, nextMock);

        expect(reqMock.logout).toHaveBeenCalledWith(expect.any(Function));
        expect(nextMock).toHaveBeenCalledWith(new Error("Logout error"));
    });

    test("should return 401 if user is not logged in", () => {
        const reqMock = {
            isAuthenticated: jest.fn().mockReturnValue(false),
        } as any;
        const resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const nextMock = jest.fn();

        auth.isLoggedIn(reqMock, resMock, nextMock);

        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Not authorized" });
    });

    test("should proceed to next middleware if user is logged in", () => {
        const reqMock = {
            isAuthenticated: jest.fn().mockReturnValue(true),
        } as any;
        const resMock = {} as any;
        const nextMock = jest.fn();

        auth.isLoggedIn(reqMock, resMock, nextMock);

        expect(nextMock).toHaveBeenCalled();
    });
});
