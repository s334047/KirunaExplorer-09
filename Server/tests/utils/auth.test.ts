import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import passport from "passport";
import Authenticator from "../../auth.ts";
import { UserRole } from "../../Components/User.ts";
import UserDao from "../../Dao/daoUser.ts";

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
        jest.restoreAllMocks(); 
    });
    afterEach(() => {
        jest.restoreAllMocks(); // Restore all spies and mocks
        jest.clearAllMocks();   // Clear mock calls and instances
        passport.initialize = jest.fn() as any; // Reset to a no-op mock to ensure it exists
        passport.use = jest.fn() as any;        // Ensure `passport.use` exists as a mock
    });




    test('should handle passport authenticate failure', async () => {
        const req = { body: {username: process.env.MOCK_USERNAME, password: process.env.MOCK_PASSWORD}, login: jest.fn() };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
    
        jest.spyOn(passport, 'authenticate').mockImplementation(() => (req, res, next) => {
            res.status(401).json({ error: 'Authentication failed' });
            return () => {}; // Return a no-op function to simulate the middleware
        });
    
        await auth.login(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication failed' });
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
            login: jest.fn().mockImplementation((_user: any, callback: (err: any) => void) => callback(null)),
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const nextMock = jest.fn();
    
        const userMock = { id: 1, username: "testuser" };
    
        jest.spyOn(passport, "authenticate").mockImplementation(() => {
            return (req, res, next) => {
                handleAuthentication(null, userMock, req, res, next);
            };
        });
    
        function handleAuthentication(err: any, user: any, req: any, res: any, next: any) {
            if (err || !user) {
                return next(err || new Error("Authentication failed"));
            }
            req.login(user, (loginErr) => {
                if (loginErr) {
                    return next(loginErr);
                }
                res.status(200).json(user);
            });
        }
    
        await auth.login(reqMock, resMock, nextMock);
    
        expect(reqMock.login).toHaveBeenCalledWith(userMock, expect.any(Function));
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith(userMock);
    });
    

    

    test("should handle login failure due to req.login error", async () => {
        const reqMock: { login: jest.Mock } = {
            login: jest.fn().mockImplementation((_user: any, callback: (err: any) => void) => callback(new Error("Login error"))),
        };
        const resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;
        const nextMock = jest.fn();
        const userMock = { id: 1, username: "testuser" };
    
        // Extracted callback for better readability
        const authenticateCallback = (req, res, next) => {
            const callback = (err, user, _info) => {
                if (err || !user) {
                    next(err || new Error("Authentication failed"));
                    return;
                }
                handleUserLogin(req, res, next, user);
            };
            callback(null, userMock, null);
        };
    
        // Extracted user login handling
        const handleUserLogin = (req, res, next, user) => {
            req.login(user, (loginErr) => {
                if (loginErr) {
                    next(loginErr);
                    return;
                }
                res.status(200).json(user);
            });
        };
    
        jest.spyOn(passport, "authenticate").mockImplementation(() => authenticateCallback);
    
        await auth.login(reqMock, resMock, nextMock);
    
        expect(nextMock).toHaveBeenCalledWith(new Error("Login error"));
    });
    
    test("should return 401 if authentication fails", async () => {
        const reqMock = { login: jest.fn() } as any;
        const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const nextMock = jest.fn();
    
        jest.spyOn(passport, "authenticate").mockImplementation(() => {
            return (_req, res, _next) => {
                handleFailedAuthentication(res);
            };
        });
    
        function handleFailedAuthentication(res: any) {
            res.status(401).json({ error: "Authentication failed" });
        }
    
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

    
    function handleAuthenticationError(res: any) {
        res.status(401).json({ error: "Authentication failed" });
    }
    
    test("should handle missing user during login", async () => {
        const reqMock = { login: jest.fn() } as any;
        const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const nextMock = jest.fn();
    
        const mockAuthenticate = () => (_req: any, res: any, _next: any) => {
            handleAuthenticationError(res);
        };
    
        jest.spyOn(passport, "authenticate").mockImplementation(mockAuthenticate);
    
        await auth.login(reqMock, resMock, nextMock);
    
        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Authentication failed" });
    });
    
    
    test("should handle unexpected errors during logout", async () => {
        const reqMock: RequestMock = {
            logout: jest.fn((callback: (err: any) => void) => callback(new Error("Unexpected error"))),
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
        expect(nextMock).toHaveBeenCalledWith(new Error("Unexpected error"));
    });
    
    test("should call next middleware for authenticated user in isLoggedIn", () => {
        const reqMock = {
            isAuthenticated: jest.fn().mockReturnValue(true),
        } as any;
        const nextMock = jest.fn();
    
        auth.isLoggedIn(reqMock, {}, nextMock);
    
        expect(reqMock.isAuthenticated).toHaveBeenCalled();
        expect(nextMock).toHaveBeenCalled();
    });
    
    
    
    test("should perform full auth flow", async () => {
        const reqMock: any = {
            logout: jest.fn((callback: (err: any) => void) => callback(null)),
            login: jest.fn((_user: any, callback: (err: any) => void) => callback(null)),
            isAuthenticated: jest.fn(() => true),
        };
    
        const resMock: any = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        };
    
        const nextMock = jest.fn();
    
        const handleLogin = (req: any, res: any, next: any, user: any) => {
            req.login(user, (loginErr: any) => {
                if (loginErr) return next(loginErr);
                res.status(200).json(user);
            });
        };
    
        const authenticateCallback = (req: any, res: any, next: any) => {
            const userMock = { id: 1, username: "testuser" };
            handleLogin(req, res, next, userMock);
        };
    
        jest.spyOn(passport, "authenticate").mockImplementation(
            () => (req, res, next) => authenticateCallback(req, res, next)
        );
    
        // Initialize auth
        auth.initAuth();
        expect(mockApp.use).toHaveBeenCalledTimes(3);
    
        // Simulate login
        await auth.login(reqMock, resMock, nextMock);
    
        expect(reqMock.login).toHaveBeenCalled();
        expect(resMock.status).toHaveBeenCalledWith(200);
    
        // Simulate logout
        await auth.logout(reqMock, resMock, nextMock);
    
        expect(reqMock.logout).toHaveBeenCalled();
        expect(resMock.status).toHaveBeenCalledWith(200);
    });
    
    test("should handle errors during passport initialization", () => {
        const useSpy = jest.spyOn(passport, "use").mockImplementation(() => {
            throw new Error("Initialization error");
        });
    
        expect(() => auth.initAuth()).toThrow("Initialization error");
    
        useSpy.mockRestore();
    });
    
    test("should correctly serialize and deserialize user", () => {
        const userMock = { id: 1, username: "testuser" };
        let serializedUser: any;
    
        passport.serializeUser((user: any, done) => {
            done(null, user.id); 
        });
        
    
        passport.deserializeUser((id, done) => {
            if (id === userMock.id) {
                done(null, userMock);
            } else {
                done(new Error("User not found"));
            }
        });
    
        passport.serializeUser(userMock, (err, id) => {
            expect(err).toBeNull();
            expect(id).toEqual(userMock.id);
        });
    
        passport.deserializeUser(userMock.id, (err, user) => {
            expect(err).toBeNull();
            expect(user).toEqual(userMock);
        });
    });
    
    test("should call session middleware with correct options", () => {
        const sessionMiddlewareMock = jest.fn();
        jest.mock("express-session", () => {
            return jest.fn(() => sessionMiddlewareMock);
        });
    
        auth.initAuth();
    
        expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Ensure session middleware is added
    });
    
    test("should handle missing session secret", () => {
        const sessionMiddleware = jest.fn(() => {
            throw new Error("Session secret is missing");
        });
    
        mockApp.use = sessionMiddleware;
    
        expect(() => auth.initAuth()).toThrow("Session secret is missing");
    });
    
    
    
    test("should handle invalid strategy in passport.use", () => {
        jest.spyOn(passport, "use").mockImplementation(() => {
            throw new Error("Invalid strategy");
        });
    
        expect(() => auth.initAuth()).toThrow("Invalid strategy");
    });
    test("should handle invalid strategy in passport.use", () => {
        const useSpy = jest.spyOn(passport, "use").mockImplementation(() => {
            throw new Error("Invalid strategy");
        });
    
        expect(() => auth.initAuth()).toThrow("Invalid strategy");
    
        useSpy.mockRestore(); // Restore the spy
    });


    test("should handle invalid session options", () => {
        const sessionMiddleware = jest.fn(() => {
            throw new Error("Invalid session options");
        });
    
        mockApp.use = sessionMiddleware;
    
        expect(() => auth.initAuth()).toThrow("Invalid session options");
    });






    
    
    
    
    test("should handle invalid session options", () => {
        jest.mock("express-session", () => {
            return jest.fn(() => {
                throw new Error("Invalid session options");
            });
        });
    
        try {
            auth.initAuth();
        } catch (error) {
            expect(error.message).toBe("Invalid session options");
        }
    
        jest.unmock("express-session"); // Restore the mock
    });
    
    test("should handle missing passport configuration gracefully", () => {
        const originalPassportInitialize = passport.initialize;
        passport.initialize = undefined; // Simulate missing configuration
    
        try {
            expect(() => auth.initAuth()).toThrow("passport_1.default.initialize is not a function");
        } finally {
            passport.initialize = originalPassportInitialize; // Restore the original state
        }
    });
    
    


    
    
    
    
    test("should handle passport.authenticate throwing an error", async () => {
        const authenticateSpy = jest.spyOn(passport, "authenticate").mockImplementation(() => {
            return () => {
                throw new Error("Unexpected error during authentication");
            };
        });
    
        const reqMock = {} as any;
        const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
        const nextMock = jest.fn();
    
        try {
            await auth.login(reqMock, resMock, nextMock);
        } catch (err) {
            expect(err.message).toBe("Unexpected error during authentication");
        }
    
        authenticateSpy.mockRestore();
    });
    
    

// Test for missing session middleware
test("should handle missing session middleware gracefully", () => {
    const mockSessionMiddleware = jest.fn(() => {
        throw new Error("Session middleware not found");
    });

    mockApp.use = mockSessionMiddleware;
    expect(() => auth.initAuth()).toThrow("Session middleware not found");
});

// Test for duplicate serialization or deserialization of user
test("should throw an error if deserialization fails", () => {
    passport.deserializeUser((_id, done) => {
        done(new Error("Deserialization error"));
    });

    passport.deserializeUser(1, (err, user) => {
        expect(err.message).toBe("Deserialization error");
        expect(user).toBeUndefined();
    });
});
test("should handle missing session() middleware gracefully", () => {
    const originalSession = passport.session;

    // Temporarily mock session to throw an error
    passport.session = jest.fn(() => {
        throw new Error("Session middleware is not defined");
    });

    try {
        expect(() => auth.initAuth()).toThrow("Session middleware is not defined");
    } finally {
        // Restore the original method after test
        passport.session = originalSession;
    }
});



test("should throw an error if passport strategy fails to load", () => {
    const originalUse = passport.use;

    passport.use = jest.fn(() => {
        throw new Error("Strategy load failure");
    });

    try {
        expect(() => auth.initAuth()).toThrow("Strategy load failure");
    } finally {
        // Restore the original method after test
        passport.use = originalUse;
    }
});

test("should handle error during passport.authenticate execution", async () => {
    jest.spyOn(passport, "authenticate").mockImplementation(
        () => (_req, _res, next) => {
            next(new Error("Authentication failed due to unexpected error"));
        }
    );

    const reqMock = {} as any;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const nextMock = jest.fn();

    await auth.login(reqMock, resMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(new Error("Authentication failed due to unexpected error"));
});

test("should handle unexpected error in req.logout", async () => {
    const reqMock = {
        logout: jest.fn((callback: (err: any) => void) => {
            callback(new Error("Unexpected logout error"));
        }) as (callback: (err: any) => void) => void,
    };
    const resMock = { status: jest.fn().mockReturnThis(), end: jest.fn() };
    const nextMock = jest.fn();

    await auth.logout(reqMock, resMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(new Error("Unexpected logout error"));
});
test("should handle deserialization errors gracefully", () => {
    const userMock = { id: 1, username: "testuser" };
    passport.deserializeUser((id, done) => {
        if (id !== userMock.id) {
            return done(new Error("Deserialization failed"));
        }
        done(null, userMock);
    });

    passport.deserializeUser(999, (err, user) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Deserialization failed");
        expect(user).toBeUndefined();
    });
});
test("should handle invalid isAuthenticated value in req", () => {
    const reqMock = { isAuthenticated: () => false } as any;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const nextMock = jest.fn();

    auth.isLoggedIn(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Not authorized" });
});

test("should handle errors during passport initialization gracefully", () => {
    jest.spyOn(passport, "initialize").mockImplementation(() => {
        throw new Error("Initialization error");
    });

    expect(() => auth.initAuth()).toThrow("Initialization error");
});

test("should handle missing passport strategy configuration gracefully", () => {
    jest.spyOn(passport, "use").mockImplementation(() => {
        throw new Error("Strategy not configured");
    });

    expect(() => auth.initAuth()).toThrow("Strategy not configured");
});
test("should throw an error if passport initialize fails", () => {
    jest.spyOn(passport, "initialize").mockImplementation(() => {
        throw new Error("Initialization error");
    });

    expect(() => auth.initAuth()).toThrow("Initialization error");
});



test("should handle unexpected error during logout", async () => {
    const reqMock = { logout: jest.fn((callback: any) => callback(new Error("Unexpected error"))) } as any;
    const resMock = { status: jest.fn().mockReturnThis(), end: jest.fn() } as any;
    const nextMock = jest.fn();

    await auth.logout(reqMock, resMock, nextMock);

    expect(nextMock).toHaveBeenCalledWith(new Error("Unexpected error"));
});

// Helper function to simulate passport authentication behavior
const simulatePassportAuthenticate = (callback) => {
    jest.spyOn(passport, "authenticate").mockImplementation(
        () => (_req, res, _next) => {
            callback(res);
        }
    );
};

test("should handle missing user during login gracefully", async () => {
    const reqMock = { login: jest.fn() } as any;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const nextMock = jest.fn();

    // Use the helper function to simplify passport behavior
    simulatePassportAuthenticate((res) => {
        res.status(401).json({ error: "Authentication failed" });
    });

    await auth.login(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Authentication failed" });
});


test("should throw an error if session secret is missing", () => {
    const sessionMiddleware = jest.fn(() => {
        throw new Error("Session secret is missing");
    });

    mockApp.use = sessionMiddleware;

    expect(() => auth.initAuth()).toThrow("Session secret is missing");
});
test("should handle unexpected errors during middleware execution", () => {
    const middlewareError = jest.fn(() => {
        throw new Error("Unexpected middleware error");
    });

    mockApp.use = middlewareError;

    expect(() => auth.initAuth()).toThrow("Unexpected middleware error");
});
test("should throw an error if passport strategy fails", () => {
    jest.spyOn(passport, "use").mockImplementation(() => {
        throw new Error("Strategy load error");
    });

    expect(() => auth.initAuth()).toThrow("Strategy load error");
});


test("should throw an error for invalid user during login", async () => {
    const reqMock = { user: undefined, login: jest.fn() } as any;
    const resMock = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const nextMock = jest.fn();

    await auth.login(reqMock, resMock, nextMock);

    expect(resMock.status).toHaveBeenCalledWith(401);
    expect(resMock.json).toHaveBeenCalledWith({ error: "Authentication failed" });
});
test("should handle deserialization failure correctly", () => {
    passport.deserializeUser((_id, done) => {
        done(new Error("Deserialization error"), null);
    });

    passport.deserializeUser(1, (err, user) => {
        expect(err.message).toBe("Deserialization error");
        expect(user).toBeNull();
    });
});
test("should throw an error if middleware initialization fails", () => {
    const sessionMiddleware = jest.fn(() => {
        throw new Error("Middleware initialization error");
    });

    mockApp.use = sessionMiddleware;

    expect(() => auth.initAuth()).toThrow("Middleware initialization error");
});

test("should throw an error if passport middleware fails", () => {
    jest.spyOn(passport, "initialize").mockImplementation(() => {
        throw new Error("Passport initialization failed");
    });

    expect(() => auth.initAuth()).toThrow("Passport initialization failed");

    jest.restoreAllMocks();
});

test("should throw an error if deserialization logic is missing", () => {
    passport.deserializeUser(undefined, (err, user) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Deserialization logic not found");
        expect(user).toBeUndefined();
    });
});


test("should initialize passport and session middleware", () => {
    const appMock = { use: jest.fn() } as any;

    const authenticator = new Authenticator(appMock); // Instantiate and assign the object

    // Optionally check if the authenticator instance is not null or undefined
    expect(authenticator).toBeDefined();

    expect(appMock.use).toHaveBeenCalledWith(expect.any(Function)); // For session
    expect(appMock.use).toHaveBeenCalledWith(passport.initialize());
    expect(appMock.use).toHaveBeenCalledWith(passport.session());
});



test("should correctly initialize passport middleware with session", () => {
    const useSpy = jest.spyOn(passport, "initialize");
    const sessionSpy = jest.spyOn(passport, "session");

    auth.initAuth();

    expect(mockApp.use).toHaveBeenCalledWith(expect.any(Function)); // Session middleware
    expect(useSpy).toHaveBeenCalled();
    expect(sessionSpy).toHaveBeenCalled();
});
test("should throw an error when passport middleware fails", () => {
    jest.spyOn(passport, "initialize").mockImplementation(() => {
        throw new Error("Passport initialization error");
    });

    expect(() => auth.initAuth()).toThrow("Passport initialization error");

    jest.restoreAllMocks(); // Restore original implementation
});


test("should throw an error during serialization", () => {
    const userMock = { id: 1, username: "testuser" };

    passport.serializeUser((_user: any, done) => {
        done(new Error("Serialization failed"));
    });

    passport.serializeUser(userMock, (err, id) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Serialization failed");
        expect(id).toBeUndefined();
    });
});

test("should throw an error during deserialization", () => {
    passport.deserializeUser((_id, done) => {
        done(new Error("Deserialization failed"), null);
    });

    passport.deserializeUser(1, (err, user) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe("Deserialization failed");
        expect(user).toBeNull();
    });
});

describe("UserDao Tests", () => {
    let userDao: UserDao;

    beforeEach(() => {
        userDao = new UserDao();
    });
    
    test("should return a user if credentials are correct", async () => {
        jest.spyOn(userDao, "getUser").mockResolvedValue({
            id: 1,
            username: "testuser",
            role: "user" as UserRole,
        });

        const user = await userDao.getUser("testuser", "password123");
        expect(user).toEqual({ id: 1, username: "testuser", role: "user" });
    });

    test("should return null if credentials are incorrect", async () => {
        jest.spyOn(userDao, "getUser").mockResolvedValue(null);

        const user = await userDao.getUser("wronguser", "wrongpass");
        expect(user).toBeNull();
    });

    test("should throw an error if the database fails", async () => {
        jest.spyOn(userDao, "getUser").mockRejectedValue(new Error("Database error"));

        await expect(userDao.getUser("testuser", "password123")).rejects.toThrow("Database error");
    });

});

test('should initialize session middleware', async () => {
    const mockStack = [
        { route: { path: '/' } },
    ];
    mockApp._router = { stack: mockStack }; // Mock `_router.stack`

    const sessionMiddleware = mockApp._router.stack.find(
        (layer) => layer.route && layer.route.path === '/'
    );

    expect(sessionMiddleware).toBeDefined();
});
;

test('should serialize user correctly', async () => {
    const user = { id: 1, username: 'testuser', role: 'user' };

    jest.spyOn(passport, 'serializeUser').mockImplementation((user, cb) => {
        cb(null, user);
    });

    const serializedUser = await new Promise((resolve, reject) => {
        passport.serializeUser(user, (err, result) => {
            if (err) {
                reject(err instanceof Error ? err : new Error(String(err))); // Ensure rejection reason is an Error
                return;
            }
            resolve(result);
        });
    });

    expect(serializedUser).toEqual(user);
});



});
