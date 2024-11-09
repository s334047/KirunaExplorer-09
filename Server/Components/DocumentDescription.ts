import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);


class DocumentDescription{
    id: number
    title: string
    stakeholder: string
    scale: string
    date: string
    type: string
    language: string
    page: number
    coordinate: number[]
    area: number[][]
    description: string

    constructor(id: number, title: string, stakeholder: string, scale: string, date: string, type: string, language: string, page: number, coordinate: number[], area:number[][], description: string){
        this.id = id;
        this.title = title,
        this.stakeholder = stakeholder,
        this.scale = scale,
        console.log(date)
        this.date = dayjs(date,'DD/MM/YYYY',true).format('DD-MM-YY').toString(),
        console.log(this.date)
        this.type = type,
        this.language = language,
        this.page = page,
        this.coordinate = coordinate,
        this.area = area,
        this.description = description
    }
}

export {DocumentDescription};