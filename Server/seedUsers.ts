import bcrypt from 'bcrypt';
import { db } from './DB/db.js';

const users = [
  { username: 'user1', password: 'password1', role: 'visitor' },
  { username: 'user2', password: 'password2', role: 'Urban Developer' },
  { username: 'user3', password: 'password3', role: 'member' },
  { username: 'admin', password: 'adminpassword', role: 'admin' }
];

// Function to seed users into the database
export const seedUsers = async () => {
  const saltRounds = 10;

  users.forEach(async (user) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    db.run(
      `INSERT INTO User (Username, Password, Salt, Role) VALUES (?, ?, ?, ?)`,
      [user.username, hashedPassword, salt, user.role],
      (err) => {
        if (err) {
          console.error(`Error inserting user ${user.username}:`, err.message);
        }
      }
    );
  });
};
