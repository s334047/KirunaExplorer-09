import { db } from "../DB/db.ts";

export default class DaoConnection {
    /* Dao functions */
    /**
     * Sets a single connection between two documents (source-target)
     * @param SourceDoc
     * @param TargetDoc 
     * @param Type 
     * @returns Boolean
     */
    SetDocumentsConnection(SourceDocId: number, TargetDocId: number, Type: string) {
        return new Promise<boolean>((resolve, reject) => {
            const query = `INSERT INTO Connection (SourceDocId, TargetDocId, Type) VALUES (?, ?, ?)`;
            db.run(query, [SourceDocId, TargetDocId, Type], (err) => {
                if (err) {
                    reject(new Error('DocumentsConnection: Database error'));
                } else
                    resolve(true);
            });
        })
    };
    /**
     * Gets all the connections from a single document
     * @param SourceDocId 
     * @returns all Connection[] from a SourceDocId
     */
    GetDocumentConnections(SourceDocId: number) {
        return new Promise<number>((resolve, reject) => {
            db.get(`SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?`, [SourceDocId, SourceDocId], (err, row: any) => {
                if (err) {
                    reject(new Error('Database error'));
                } else
                    resolve(row.n as number);
            });
        });
    };

    GetDocumentInfoConnections(SourceDocId: number) {
        return new Promise<{ id: number, title: string, type: string }[]>((resolve, reject) => {
            const query = `
                SELECT 
                    d.Id as id, 
                    d.Title as title, 
                    c.Type as type
                FROM Connection c
                JOIN Document d ON c.SourceDocId = d.Id OR c.TargetDocId = d.Id
                WHERE (c.SourceDocId = ? OR c.TargetDocId = ?)
                  AND d.Id != ?`;

            db.all(query, [SourceDocId, SourceDocId, SourceDocId], (err, rows: { id: number, title: string, type: string }[]) => {
                if (err) {
                    console.error("Database error:", err);
                    reject(new Error('Database error'));
                }
                else
                    resolve(rows);
            });
        });
    };



    /* Secondary functions */
    /**
     * Gets the Id of a document
     * @param Title 
     * @returns DocumentId from Title
     */
    GetDocumentsId(Title: string) {
        return new Promise<number>((resolve, reject) => {
            db.get(`SELECT Id FROM Document WHERE Title = ?`, [Title], (err, row: any) => {
                if (err) {
                    reject(new Error('Database error'));
                } else {
                    resolve(row.Id as number);
                }
            });
        });
    }
    /**
     * Verify that there are no connection duplicated
     * @param SourceDocId 
     * @param TargetDocId 
     * @returns Boolean
     */
    FindDuplicatedDocument(SourceDocId: number, TargetDocId: number, Type: string) {
        return new Promise<boolean>((resolve, reject) => {
            db.get(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ? AND Type = ?`, [TargetDocId, SourceDocId, Type], (err, rows:any) => {
                if (err) {
                    reject(new Error('Database error'));
                }
                else{
                    if (rows)
                        resolve(false);
                    else{
                        db.get(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ? AND Type = ?`, [SourceDocId, TargetDocId, Type], (err, rows:any) => {
                            if (err) {
                                reject(new Error('Database error'));
                            }
                            else{
                                if (rows)
                                    resolve(false);
                                else{
                                    resolve(true);
                                }   
                            }
                        });
                    }   
                }
            });
        });
    };
    /**
     * Gets all the connections from the database
     * @returns Connection[]
     */
    GetConnections() {
        return new Promise<{ SourceDocId: number, TargetDocId: number, Type: string }[]>((resolve, reject) => {
            db.all(`SELECT SourceDocId as source, TargetDocId as target, Type as type FROM Connection`, (err, rows: { SourceDocId: number, TargetDocId: number, Type: string }[]) => {
                if (err) {
                    reject(new Error('Database error'));
                }
                else
                    resolve(rows);
            });
        });
    }
}