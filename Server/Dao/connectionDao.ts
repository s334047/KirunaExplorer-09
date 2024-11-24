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
    SetDocumentsConnection(SourceDoc: String, TargetDoc: String, Type: String) {
        return new Promise<boolean>(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            const TargetDocId = await this.GetDocumentsId(TargetDoc);
            if (SourceDocId && TargetDocId) { // If both Documents Id exist, then we can create the connection
                if (await this.FindDuplicatedDocument(SourceDocId, TargetDocId)) { //without duplicates
                    const query = `INSERT INTO Connection (SourceDocId, TargetDocId, Type) VALUES (?, ?, ?)`;
                    db.run(query, [SourceDocId, TargetDocId, Type], (err) => {
                        if (err) {
                            reject("DocumentsConnection: " + err);
                            return false;
                        } else {
                            resolve(true);
                            return true;
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
    GetDocumentConnections = async (SourceDoc: String): Promise<Number> => {
        return new Promise(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            if (SourceDocId) {
                db.get(`SELECT  COUNT(*) as n FROM Connection WHERE SourceDocId = ? OR TargetDocId = ?`, [SourceDocId, SourceDocId], (err, row: any) => {
                    if (err) {
                        reject(err);
                        return false;
                    } else {
                        resolve(row.n as Number);
                        return true;
                    }
                });
            } else {
                reject("SourceDocId not found");
                return false;
            }
        });
    };

    GetDocumentInfoConnections = async (SourceDocId: Number): Promise<{ id: number, title: string, type: string }[]> => {
        return new Promise(async (resolve, reject) => {
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
                    return reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    };



    /* Secondary functions */
    /**
     * Gets the Id of a document
     * @param Title 
     * @returns DocumentId from Title
     */
    GetDocumentsId = async (Title: String): Promise<Number> => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT Id FROM Document WHERE Title = ?`, [Title], (err, row: any) => {
                if (err) {
                    reject(err);
                    return false;
                } else {
                    resolve(row.Id as Number);
                    return true;
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
    FindDuplicatedDocument = async (SourceDocId: Number, TargetDocId: Number): Promise<Boolean> => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT Id FROM Connection WHERE SourceDocId = ? AND TargetDocId = ?`, [TargetDocId, SourceDocId], (err, rows) => {
                if (err) {
                    reject(err);
                    return false;
                } else {
                    if (rows.length > 0) {
                        resolve(false);
                        return false;
                    } else {
                        resolve(true);
                        return true;
                    }
                }
            });
        });
    };
}