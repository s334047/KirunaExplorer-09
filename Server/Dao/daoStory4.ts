import { db } from "../DB/db.js";
import { DocumentDescription } from "../Components/DocumentDescription.js";
import { Coordinates } from "../Components/Georeference.ts";

export default class daoStory4{
    getAllDoc(){
        return new Promise<DocumentDescription[]>((resolve, reject) => {
            const query = `SELECT *
                            FROM Document`;
            db.all(query, [], (err: any, rows: any[]) => {
                if(err)
                    reject(err);
                else{
                    let docs=[];
                    for(let row of rows){
                        if(!row.coordinate){
                            docs.push(new DocumentDescription(row.Title,row.Stakeholder,row.Scale,row.Date,row.Type,row.Language,row.Page,row.Coordinate,row.Description))
                        }
                        else{
                            const coord = row.Coordinate
                            .replace(/\[|\]/g, "")     
                            .split(",")
                            .map(num => parseFloat(num.trim()));
                            docs.push(new DocumentDescription(row.Title,row.Stakeholder,row.Scale,row.Date,row.Type,row.Language,row.Page,new Coordinates(coord[0],coord[1]),row.Description))
                        }
                    }
                    resolve(docs)
                }
            })
        })
    }
}