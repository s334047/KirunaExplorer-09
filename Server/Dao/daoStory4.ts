import { db } from "../DB/db.js";
import { DocumentDescription } from "../Components/DocumentDescription.js";
import { Coordinates } from "../Components/Georeference.ts";

export default class daoStory4{
    getAllDoc(){
        return new Promise<DocumentDescription[]>((resolve, reject) => {
            const query = `SELECT *
                            FROM Document`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    let docs:DocumentDescription[]=rows.map(row=>new DocumentDescription(row.Title,row.Stakeholder,row.Scale,row.Date,row.Type,row.Language,row.Page,JSON.parse(row.Coordinate),row.Description))
                    resolve(docs)
                }
            })
        })
    }
}