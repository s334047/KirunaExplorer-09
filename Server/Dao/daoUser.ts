import { db } from "../DB/db.js";
import { User, UserRole } from "../Components/User.js";
import crypto from "crypto";

export default class UserDao {
    /**
     * Gets a user by username and verifies the password
     * @param username - The username of the user
     * @param password - The password of the user
     * @returns A promise that resolves to the user object or false
     */
    getUser = (username: string, password: string): Promise<User | false> => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM User WHERE Username = ?';
            db.get(sql, [username], (err: Error | null, row: any) => {
                if (err) {
                    return reject(err);
                }
                
                if (!row || !row.Salt) {
                    return resolve(false);
                }

                const user: User = new User(row.Id, row.Username, row.Role);
                crypto.scrypt(password, row.Salt, 32, (err, hashedPassword) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!crypto.timingSafeEqual(Buffer.from(row.Password, 'hex'), hashedPassword)) {
                        return resolve(false);
                    } else {
                        return resolve(user);
                    }
                });
            });
        });
    };
}
