import dayjs from 'dayjs';
import { Coordinates } from './Georeference.js';

class DocumentDescription{
    title: string
    stakeholder: string
    scale: string
    date: string
    type: string
    language: string
    page: number
    coordinate: Coordinates
    area: string
    description: string

    constructor(title: string, stakeholder: string, scale: string, date: string, type: string, language: string, page: number, coordinate: Coordinates, description: string){
        this.title = title,
        this.stakeholder = stakeholder,
        this.scale = scale,
        this.date = dayjs(date).format('DD-MM-YY').toString(),
        this.type = type,
        this.language = language,
        this.page = page,
        this.coordinate = coordinate,
        this.description = description
    }
}

export {DocumentDescription};