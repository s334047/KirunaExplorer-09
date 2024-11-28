import { db } from "../DB/db.ts";
import { DocumentDescription } from "../Components/DocumentDescription.ts";

export default class DaoDocument {

    newDescription(title: string, sh: string, sc: string, date: string, type: string, lang: string, page: number, coord: number[],area:number, descr: string){
        return new Promise<void>((resolve, reject) => {
            let coordTemp:string=null;
            if(coord!=null){
                  coordTemp = '['+coord[0]+','+coord[1]+']'
            }
            const query = `INSERT INTO Document 
                            (Title, Stakeholder, Scale, Date, Type, Language, Page, Coordinate,Area, Description)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query, [title, sh, sc, date, type, lang, page, coordTemp,area, descr], function(err){
                if(err)
                    reject(new Error('Database error'));
                else
                    resolve();
            });
        });
    };

    getAllDoc(){
        return new Promise<DocumentDescription[]>((resolve, reject) => {
            const query = `SELECT D.Id,Title,Stakeholder,Scale,Date,Type,Language,Page,Coordinate,Vertex,Description
                            FROM  Document D
                            LEFT JOIN Area A
                            ON D.Area = A.Id;`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(new Error('Database error'));
                else{
                    let docs: DocumentDescription[] = rows.map(row => 
                        new DocumentDescription(
                            row.Id,
                            row.Title,
                            row.Stakeholder,
                            row.Scale,
                            row.Date,
                            row.Type,
                            row.Language,
                            row.Page,
                            JSON.parse(row.Coordinate),
                            row.Vertex 
                                ? JSON.parse(
                                    row.Vertex
                                  )
                                : null,
                            row.Description
                        )
                    );
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
                    reject(new Error('Database error'));
                else{
                    let docs=rows.map(row=>row.Title);
                    resolve(docs)
                }
            })
        })
    }

    getDocumentIdFromTitle(title : string){
        return new Promise<number>((resolve, reject) => {
            const query = `SELECT Id
                            FROM Document
                            WHERE Title = ?`;
            db.get(query, [title], (err: any, row: any) => {
                if(err)
                    reject(new Error('Database error'));
                else
                    resolve(row.Id);
            })
        })
    }
}