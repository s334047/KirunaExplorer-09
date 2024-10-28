import  sqlite  from "sqlite3";

export const db = new sqlite.Database("./DB/db.db", (err) => {
    if(err) throw err;
});