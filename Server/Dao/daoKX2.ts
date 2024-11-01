import { Connection } from "../Components/Connection.js";
import { db } from "../DB/db.js";

export default class DaoKX2 {
    /* Dao functions */
    /**
     * Sets a single connection between two documents (source-target)
     * @param SourceDoc
     * @param TargetDoc 
     * @param Type 
     * @returns Boolean
     */
    SetDocumentsConnection = async (SourceDoc: String, TargetDoc: String, Type: String): Promise<Boolean> => {
        return new Promise(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            const TargetDocId = await this.GetDocumentsId(TargetDoc)
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
    GetDocumentConnections = async (SourceDoc: String): Promise<Connection[]> => {
        return new Promise(async (resolve, reject) => {
            const SourceDocId = await this.GetDocumentsId(SourceDoc);
            if (SourceDocId) {
                db.all(`SELECT * FROM Connection WHERE SourceDocId = ?`, [SourceDocId], (err, rows) => {
                    if (err) {
                        reject(err);
                        return false;
                    } else {
                        resolve(rows as Connection[]);
                        return true;
                    }
                });
            } else {
                reject("SourceDocId not found");
                return false;
            }
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
            db.get(`SELECT Id FROM Document WHERE Title = ?`, [Title], (err, row) => {
                if (err) {
                    reject(err);
                    return false;
                } else {
                    resolve(row as Number);
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