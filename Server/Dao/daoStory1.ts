import { db } from "../DB/db.js";

export default class Dao {
    newDescription(title: string, sh: string, sc: string, date: string, type: string, lang: string, page: number, coord: string, area: string, descr: string){
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO Document 
                            (Title, Stakeholder, Scale, Date, Type, Language, Page, Coordinate, Area, Description)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query, [title, sh, sc, date, type, lang, page, coord, area, descr], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };
};