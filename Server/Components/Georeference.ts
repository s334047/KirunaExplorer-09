
class Coordinates{
    coords : [number, number]
 
     constructor(lat: number, lon: number){
       this.coords = [lat, lon];
     }
 }
 
class Area{
   id: number
   name: string
   vertex: Coordinates[];

    constructor(id: number, name: string, vertex: Coordinates[]){
        this.id = id,
        this.name = name,
        this.vertex = vertex;        
    }
}

export {Area, Coordinates};