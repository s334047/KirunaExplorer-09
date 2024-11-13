import express, { Router } from "express"
import Authenticator from "./auth.ts"

export default class AuthRoutes {
    private router: Router
    private authService: Authenticator

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.router = express.Router();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router
    }

    initRoutes() {

        /**
         * Route for logging in a user.
         * It does not require authentication.
         * It expects the following parameters:
         * - username: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns an error if the username represents a non-existing user or if the password is incorrect.
         * It returns the logged in user.
         */
        this.router.post(
            "/",
            (req, res, next) => this.authService.login(req, res, next)
                //.then((user: any) => res.status(200).json(user))
                //.catch((err: any) => { res.status(401).json(err) })
        )

        /**
         * Route for logging out the currently logged in user.
         * It expects the user to be logged in.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/current",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),
            (req, res, next) => this.authService.logout(req, res, next)
                //.then(() => res.status(200).end())
                //.catch((err: any) => next(err))
        )

        /**
         * Route for retrieving the currently logged in user.
         * It expects the user to be logged in.
         * It returns the logged in user.
         */
        this.router.get(
            "/current",
            (req: any, res: any, next: any) => this.authService.isLoggedIn(req, res, next),            
            (req: any, res: any) => res.status(200).json(req.user)
        )
    }
}