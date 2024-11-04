import  sqlite  from "sqlite3";

export const db = new sqlite.Database("./DB/db.db", (err: Error | null)=> {
    if(err) throw err;
});