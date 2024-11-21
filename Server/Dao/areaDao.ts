import { db } from "../DB/db.ts";
import { Area } from "../Components/Georeference.ts";

export default class DaoArea {
    addAreaToDoc(areaId: number, documentId: number){
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO AreaDocLink
                            (AreaId, DocumentId)
                            VALUES(?,?)`;
            db.run(query, [areaId, documentId], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    getAllAreas(){
        return new Promise<Area[]>((resolve, reject) => {
            const query = `SELECT *
                            FROM Area`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    let areas: Area[] = rows.map(row => new Area(row.Id, row.Name, JSON.parse(row.Vertex.replace(/\]\s*\[/g, '],[')
                    .replace(/'/g, '"')
                    .replace(/(\[\s*)/g, '[')
                    .replace(/(\s*\])/g, ']'))));
                    resolve(areas);
                }
            })
        })
    }

    addArea(name: string, vertex: number[][]){      
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO Area
                            (Name, Vertex)
                            VALUES(?,?)`;
            db.run(query, [name, JSON.stringify(vertex)], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    modifyGeoreference(id:number,coordinate:number[],oldCoordinate:number[],area:number[][],oldArea:number[][]){
        return new Promise<void>(async (resolve,reject)=>{
            if(coordinate && !oldCoordinate){
                const sql="UPDATE Document SET Coordinate = ?, Area = NULL WHERE Id = ?"
                db.run(sql,[JSON.stringify(coordinate).replace(/"/g, ""),id],function(err){
                    if(err){
                        reject(err);
                        return;
                    }
                    else{
                        resolve();
                        return;
                    }
                })
            }
            if(coordinate && oldCoordinate){
                const sql="UPDATE Document SET Coordinate = ? WHERE Id = ?"
                db.run(sql,[JSON.stringify(coordinate).replace(/"/g, ""),id],function(err){
                    if(err){
                        reject(err);
                        return;
                    }
                    else{
                        resolve();
                        return;
                    }
                })
            }
            if(area && oldArea){
                const a_id = await this.getAreaIdByCoordinate(oldArea);
                const sql="UPDATE Area SET Vertex = ? WHERE Id = ?"
                db.run(sql,[JSON.stringify(area),a_id],function(err){
                    if(err){
                        reject(err);
                        return;
                    }
                    else{
                        resolve();
                        return;
                    }
                })
            }
            if(area && !oldArea){
                const a_id = await this.getAreaIdByCoordinate(area);
                const sql="UPDATE Document SET Area = ?,  Coordinate = NULL WHERE Id = ?"
                db.run(sql,[a_id,id],function(err){
                    if(err){
                        reject(err);
                        return;
                    }
                    else{
                        resolve();
                        return;
                    }
                })
            }
        })
    }

    getAreaIdByCoordinate(vertex:number[][]){
        return new Promise<number>((resolve,reject)=>{
            const sql = "SELECT Id FROM Area WHERE Vertex = ?"
            db.get(sql, [JSON.stringify(vertex)], (err: any, row: any) => {
                if(err)
                    reject(err);
                if(!row){
                    resolve(null)
                }
                else{
                    resolve(row.Id);
                }
            })
        })
    }

    getAreaIdFromName(name : string){
        return new Promise<number>((resolve, reject) => {
            const query = `SELECT Id
                            FROM Area
                            WHERE Name = ?`;
            db.get(query, [name], (err: any, row: any) => {
                if(err)
                    reject(err);
                if(!row){
                    resolve(null)
                }
                else
                    resolve(row.Id);
            })
        })
    }
}