import { db } from "../DB/db.ts";
import Resource from "../Components/Resource.ts";
export default class DaoResource {
    addOriginalResource(path: string, docId: number){
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO Resource
                            (Path, DocumentId)
                            VALUES (?, ?)`;
            db.run(query, [path, docId], function(err){
                if(err)
                    reject(err);
                resolve();
            })
        })
    }

    getResourcesByDoc(docId: number){
        return new Promise<Resource[]>((resolve, reject) => {
            const query = `SELECT Id, Path, DocumentId
                            FROM Resource
                            WHERE DocumentId = ?`;
            db.all(query, [docId], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                const result: Resource[] = rows.map(row => new Resource(row.Id, row.Path, row.DocumentId));
                resolve(result);
            })
        })
    }

    getResourceById(id: number){
        return new Promise<Resource>((resolve, reject) => {
            const query = `SELECT Id, Path, DocumentId
                            FROM Resource
                            WHERE Id = ?`;
            db.get(query, [id], (err: any, row: any) => {
                if(err)
                    reject(err);
                const result: Resource = new Resource(row.Id, row.Path, row.DocumentId);
                resolve(result);
            })
        })
    }
}