// this file is used to create hashed passwords for the users in the database.if you do not want to change the password of the users in the database, you can ignore this file.
//With this command you can create hashed password "npx ts-node createUsers.js"


import bcrypt from 'bcrypt';

async function createUsers() {
  // User information (username, plain password, and role)
  const users = [
    { username: 'user1', password: 'password1', role: 'planner' },
    { username: 'user2', password: 'password2', role: 'resident' },
    { username: 'user3', password: 'password3', role: 'urban_developer' },
    { username: 'admin', password: 'adminpassword', role: 'admin' },
  ];

  // Salt rounds
  const saltRounds = 10;

  try {
    for (const user of users) {
      // Hash the user's password
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      // Log the user details (to be inserted into the database)
      console.log(`Username: ${user.username}`);
      console.log(`Hashed Password: ${hashedPassword}`);
      console.log(`Role: ${user.role}`);
      console.log('----------------------');
    }
  } catch (err) {
    console.error("Error hashing password:", err);
  }
}

createUsers();
