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
    SetDocumentsConnection(SourceDoc: string, TargetDoc: string, Type: string) {
        return new Promise<boolean>(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            const TargetDocId = await this.GetDocumentsId(TargetDoc);
            if (SourceDocId && TargetDocId) { // If both Documents Id exist, then we can create the connection
                if (await this.FindDuplicatedDocument(SourceDocId, TargetDocId)) { //without duplicates
                    const query = `INSERT INTO Connection (SourceDocId, TargetDocId, Type) VALUES (?, ?, ?)`;
                    db.run(query, [SourceDocId, TargetDocId, Type], (err) => {
                        if (err) {
                            reject(new Error('DocumentsConnection: Database error'));
                            return false;
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    reject("Duplicate connection on FindDuplicatedDocument\n");
                    return false;
                }
            } else {
                reject("SourceDocId or TargetDocId not found");
                return false;
            }
        });
    };
    /**
     * Gets all the connections from a single document
     * @param SourceDocId 
     * @returns all Connection[] from a SourceDocId
     */
    GetDocumentConnections = async (SourceDoc: string): Promise<number> => {
        return new Promise(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            if (SourceDocId) {
                db.get(`SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?`, [SourceDocId, SourceDocId], (err, row: any) => {
                    if (err) {
                        reject(new Error('Database error'));
                    } else 
                        resolve(row.n as number);
                });
            } else {
                reject("SourceDocId not found");
            }
        });
    };

    GetDocumentInfoConnections = async (SourceDocId: number): Promise<{ id: number, title: string, type: string }[]> => {
        return new Promise((resolve, reject) => {
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
    GetDocumentsId = async (Title: string): Promise<number> => {
        return new Promise((resolve, reject) => {
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
    FindDuplicatedDocument = async (SourceDocId: number, TargetDocId: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ?`, [TargetDocId, SourceDocId], (err, rows) => {
                if (err) {
                    reject(new Error('Database error'));
                } else {
                    if (rows.length > 0) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            });
        });
    };
}