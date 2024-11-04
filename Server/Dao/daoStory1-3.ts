import { db } from "../DB/db.ts";
import { resolve } from "path";
import { Area, Coordinates } from "../Components/Georeference.ts";
export default class Dao {

    /**story 1 */
    newDescription(title: string, sh: string, sc: string, date: string, type: string, lang: string, page: number, coord: Coordinates, descr: string){
        return new Promise<void>((resolve, reject) => {
            const coordTemp: string = '[ '+coord[0]+', '+coord[1]+' ]'
            console.log(coordTemp);
            const query = `INSERT INTO Document 
                            (Title, Stakeholder, Scale, Date, Type, Language, Page, Coordinate, Description)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(query, [title, sh, sc, date, type, lang, page, coordTemp, descr], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    /**story 3 */
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
                    console.log(areas);
                    resolve(areas);
                }
            })
        })
    }
    

    //-------------------------------------------

    addArea(name: string, vertex: Coordinates[]){      
        console.log('sono in dao, vertex: ', vertex);
        let vertexTemp = '[ ';
        for(let i=0; i<vertex.length; i++){
            vertexTemp = vertexTemp + '[ '+vertex[i]+ ' ]';
        }
        vertexTemp = vertexTemp+' ]';
        console.log(vertexTemp);
        return new Promise<void>((resolve, reject) => {
            const query = `INSERT INTO Area
                            (Name, Vertex)
                            VALUES(?,?)`;
            db.run(query, [name, vertexTemp], function(err){
                if(err)
                    reject(err);
                else
                    resolve();
            });
        });
    };

    getAreaIdFromName(name : string){
        return new Promise<number>((resolve, reject) => {
            const query = `SELECT Id
                            FROM Area
                            WHERE Name = ?`;
            db.get(query, [name], (err: any, row: number) => {
                if(err)
                    reject(err);
                else
                    resolve(row);
            })
        })
    }

    getDocumentIdFromTitle(title : string){
        return new Promise<number>((resolve, reject) => {
            const query = `SELECT Id
                            FROM Document
                            WHERE Title = ?`;
            db.get(query, [title], (err: any, row: number) => {
                if(err)
                    reject(err);
                else
                    resolve(row);
            })
        })
    }

    getAllCoordinates(){  //BOZZA DI FUNZIONE!!! sta da creare la tabella eccetera
        return new Promise<string>((resolve, reject) => {
            const query = `SELECT *
                            FROM Coordinate`;
            db.all(query, [], (err: any, rows: any) => {
                if(err)
                    reject(err);
                else
                    resolve(rows);
            })
        })
    }
};