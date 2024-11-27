import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import express from "express";
import session from "express-session";
import passport from "passport";
import Authenticator from "../../auth.ts";

jest.mock("../../Dao/daoUser.ts");
jest.mock("passport");

// Mock `express-session` to return a middleware function
jest.mock("express-session", () => {
  return jest.fn(() => (req, res, next) => next());
});

describe("Auth Tests", () => {
  let app: express.Application;
  let auth: Authenticator;

  beforeEach(() => {
    // Mock `use` method on the Express app
    app = {
      use: jest.fn(),
    } as unknown as express.Application;

    auth = new Authenticator(app);

    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe("Initialization", () => {
    test("it should initialize session and passport", () => {
      const sessionMiddleware = session();

      auth.initAuth();

      // Ensure `app.use` is called for all middlewares
      expect(app.use).toHaveBeenCalledTimes(3);
      expect(app.use).toHaveBeenCalledWith(sessionMiddleware); // Mocked session middleware
      expect(app.use).toHaveBeenCalledWith(passport.initialize());
      expect(app.use).toHaveBeenCalledWith(passport.session());
    });
  });

  describe("Login", () => {
    test("it should authenticate and login the user", async () => {
      const reqMock = {
        login: jest.fn((user: any, cb: (err?: any) => void) => cb(null)),
      } as any;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const nextMock = jest.fn();
      const userMock = { id: 1, username: "testuser" };

      jest.spyOn(passport, "authenticate").mockImplementation(
        () => (req, res, next) => {
          const callback = (err: any, user: any, info: any) => {
            if (err || !user) return next(err || new Error("Auth failed"));
            req.login(user, (loginErr: any) => {
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

    test("it should handle authentication failure", async () => {
      const reqMock = { login: jest.fn() } as any;
      const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const nextMock = jest.fn();

      jest.spyOn(passport, "authenticate").mockImplementation(
        () => (req, res, next) => {
          const callback = (err: any, user: any, info: any) => {
            res.status(401).json({ error: "Authentication failed" });
          };
          callback(null, null, new Error("Authentication failed"));
        }
      );

      await auth.login(reqMock, resMock, nextMock);

      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: "Authentication failed" });
    });

    test("it should handle login errors", async () => {
      const reqMock = {
        login: jest.fn().mockImplementation((user: any, cb: any) => cb(new Error("Login error"))),
      } as any;
      const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const nextMock = jest.fn();
      const userMock = { id: 1, username: "testuser" };

      jest.spyOn(passport, "authenticate").mockImplementation(
        () => (req, res, next) => {
          const callback = (err: any, user: any, info: any) => {
            req.login(user, (loginErr: any) => {
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
  });

  describe("Logout", () => {
    test("it should logout the user", async () => {
      const reqMock = { logout: jest.fn((cb: (err?: Error) => void) => cb()) } as any;
      const resMock = { status: jest.fn().mockReturnThis(), end: jest.fn() } as any;
      const nextMock = jest.fn();

      await auth.logout(reqMock, resMock, nextMock);

      expect(reqMock.logout).toHaveBeenCalledWith(expect.any(Function));
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.end).toHaveBeenCalled();
    });

    test("it should handle logout errors", async () => {
      const reqMock = { logout: jest.fn((cb: (err?: Error) => void) => cb(new Error("Logout error"))) } as any;
      const resMock = { status: jest.fn().mockReturnThis(), end: jest.fn() } as any;
      const nextMock = jest.fn();

      await auth.logout(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalledWith(new Error("Logout error"));
    });
  });

  describe("isLoggedIn Middleware", () => {
    test("it should call next if user is authenticated", () => {
      const reqMock = { isAuthenticated: jest.fn().mockReturnValue(true) } as any;
      const resMock = {} as any;
      const nextMock = jest.fn();

      auth.isLoggedIn(reqMock, resMock, nextMock);

      expect(nextMock).toHaveBeenCalled();
    });

    test("it should return 401 if user is not authenticated", () => {
      const reqMock = { isAuthenticated: jest.fn().mockReturnValue(false) } as any;
      const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const nextMock = jest.fn();

      auth.isLoggedIn(reqMock, resMock, nextMock);

      expect(resMock.status).toHaveBeenCalledWith(401);
      expect(resMock.json).toHaveBeenCalledWith({ error: "Not authorized" });
    });
  });
});
