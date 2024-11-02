import { db } from "../DB/db.js";
import { Area } from "../Components/Area.js";
import { resolve } from "path";

export default class Dao {

    /**story 1 */
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

    /**story 3 */
    addGeoreference(id: number, coord: string, area: string){
        return new Promise<void>((resolve, reject) => {
            const query = `UPDATE Document 
                            SET Coordinate = ?, Area = ?
                            WHERE Id = ?`;
            db.run(query, [coord, area, id], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    getAllAreas(){
        return new Promise<Area[]>((resolve, reject) => {
            const query = `SELECT *
                            FROM Area`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    const areas: Area[] = rows.map(row => new Area (row.Id, row.Name, row.Vertex));
                    console.log(areas);
                    resolve(areas);
                }
            })
        })
    }

    addArea(name: string, vertex: string){
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO Area
                            (Name, Vertex)
                            VALUES(?,?)`;
            db.run(query, [name, vertex], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    getAllCoordinates(){  //BOZZA DI FUNZIONE!!! sta da creare la tabella eccetera
        return new Promise<string>((resolve, reject) => {
            const query = `SELECT *
                            FROM Coordinate`;
            db.all(query, [], (err: any, rows: any) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            })
        })
    }
};