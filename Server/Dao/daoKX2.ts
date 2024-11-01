import { Connection } from "../Components/Connection.js";
import { db } from "../DB/db.js";

export default class DaoKX2 {
    // Sets a single connection between two documents (source-target)
    SetDocumentsConnection = async (SourceDocId: Number, TargetDocId: Number, Type: String): Promise<Boolean | String> => {
        return new Promise(async (resolve, reject) => {
            if (await this.FindDuplicatedDocument(SourceDocId, TargetDocId)) {
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
                reject("Duplicate connection on ControllaDuplicati\n");
                return false;
            }
        });
    };
    // Gets all the connections from a document
    GetDocumentConnections = async (SourceDocId: Number): Promise<Connection[]> => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM Connection WHERE SourceDocId = ?`, [SourceDocId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Connection[]);
                }
            });
        });
    };
    // Verify that there are no connection duplicated
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