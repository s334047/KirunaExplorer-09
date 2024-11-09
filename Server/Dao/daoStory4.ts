import { db } from "../DB/db.ts";
import { DocumentDescription } from "../Components/DocumentDescription.ts";

export default class daoStory4{
    getAllDoc(){
        return new Promise<DocumentDescription[]>((resolve, reject) => {
            const query = `SELECT D.Id,Title,Stakeholder,Scale,Date,Type,Language,Page,Coordinate,Vertex,Description
                            FROM  Document D
                            LEFT JOIN Area A
                            ON D.Area = A.Id;`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
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
                                    row.Vertex.replace(/\]\s*\[/g, '],[')
                                        .replace(/'/g, '"')
                                        .replace(/(\[\s*)/g, '[')
                                        .replace(/(\s*\])/g, ']')
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
                    reject(err);
                else{
                    let docs=rows.map(row=>row.Title);
                    resolve(docs)
                }
            })
        })
    }
}