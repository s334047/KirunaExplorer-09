import { db } from "../DB/db.ts";

export default class DaoResource {
    addOriginalResource(path: string, docId: number){
        console.log('path: '+path)
        console.log('docID: '+docId)
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
}