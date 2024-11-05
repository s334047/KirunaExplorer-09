import { db } from "../DB/db.js";
import { DocumentDescription } from "../Components/DocumentDescription.js";

export default class daoStory4{
    getAllDoc(){
        return new Promise<DocumentDescription[]>((resolve, reject) => {
            const query = `SELECT *
                            FROM Document`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    let docs:DocumentDescription[]=rows.map(row=>new DocumentDescription(row.Id, row.Title,row.Stakeholder,row.Scale,row.Date,row.Type,row.Language,row.Page,JSON.parse(row.Coordinate),row.Description))
                    resolve(docs)
                }
            })
        })
    }
 
    getAllDocOfArea(id:number){
        return new Promise<string[]>((resolve, reject) => {
            const query = `SELECT title
                            FROM AreaDocLink A, Document  D
                            WHERE D.Id = A.DocumentId AND A.AreaId = ?`;
            db.all(query, [id], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    let docs=rows.map(row=>row.Title);
                    resolve(docs)
                }
            })
        })
    }
}