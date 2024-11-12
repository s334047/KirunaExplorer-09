// lo scrivo qua per ora poi possiamo spostarlo
import { db } from "../DB/db.ts";
export default class DaoStory5{
    modifyGeoreference(id:number,coordinate:number[],oldCoordinate:number[],area:number[][],oldArea:number[][]){
        return new Promise<void>(async (resolve,reject)=>{
            if(coordinate && !oldCoordinate){
                const sql="UPDATE Document SET Coordinate = ?, Area = NULL WHERE Id = ?"
                db.run(sql,[JSON.stringify(coordinate),id],function(err){
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
                db.run(sql,[JSON.stringify(coordinate),id],function(err){
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
}