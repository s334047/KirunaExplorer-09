import bcrypt from 'bcrypt';
import { Database } from 'sqlite3';

class UserDAO {
    private db: Database;

    constructor(database: Database) {
        this.db = database;
    }

    
    createUser(username: string, password: string, role: string): Promise<void> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error("Error hashing password:", err.message);
                    return reject("Could not hash password");
                }

                const query = `INSERT INTO Users (username, password, role) VALUES (?, ?, ?)`;
                this.db.run(query, [username, hashedPassword, role], function (err) {
                    if (err) {
                        console.error("Error inserting new user:", err.message);
                        return reject("Could not create user");
                    }
                    resolve();
                });
            });
        });
    }

    
    async findUserByUsername(username: string): Promise<any> {
        return new Promise((resolve, reject) => {
          const query = `SELECT * FROM User WHERE username = ?`;
          console.log("Executing query:", query, "with username:", username); // Log query
          this.db.get(query, [username], (err, row) => {
            if (err) {
              console.error("Error finding user:", err.message);
              return reject("Could not find user");
            }
            if (!row) {
              console.error("User not found in database for username:", username);
            } else {
              console.log("User found:", row);
            }
            resolve(row);
          });
        });
      }
      

    
    getAllUsers(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Users`;
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    console.error("Error fetching users:", err.message);
                    return reject("Could not fetch users");
                }
                resolve(rows);
            });
        });
    }

    
    updateUser(username: string, newDetails: Partial<{ password: string; role: string }>): Promise<void> {
        return new Promise((resolve, reject) => {
            // Update the password if provided
            if (newDetails.password) {
                bcrypt.hash(newDetails.password, 10, (err, hashedPassword) => {
                    if (err) {
                        console.error("Error hashing password:", err.message);
                        return reject("Could not hash password");
                    }

                    const query = `UPDATE Users SET password = ? WHERE username = ?`;
                    this.db.run(query, [hashedPassword, username], function (err) {
                        if (err) {
                            console.error("Error updating user password:", err.message);
                            return reject("Could not update user password");
                        }
                        resolve();
                    });
                });
            } else if (newDetails.role) {
                // Update the role if provided
                const query = `UPDATE Users SET role = ? WHERE username = ?`;
                this.db.run(query, [newDetails.role, username], function (err) {
                    if (err) {
                        console.error("Error updating user role:", err.message);
                        return reject("Could not update user role");
                    }
                    resolve();
                });
            } else {
                reject("No valid fields provided for update");
            }
        });
    }

    
    deleteUser(username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM Users WHERE username = ?`;
            this.db.run(query, [username], function (err) {
                if (err) {
                    console.error("Error deleting user:", err.message);
                    return reject("Could not delete user");
                }
                resolve();
            });
        });
    }

    

    login(username: string, password: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Users WHERE username = ?`;
            this.db.get(query, [username], async (err, row: { password: string; username: string; role: string }) => {
                if (err) {
                    console.error("Error finding user:", err.message);
                    return reject("Could not find user");
                }
                if (!row) {
                    return reject("User not found");
                }

                const match = await bcrypt.compare(password, row.password);
                if (match) {
                    resolve({ username: row.username, role: row.role });
                } else {
                    reject("Invalid password");
                }
            });
        });
    }
}

export default UserDAO;
