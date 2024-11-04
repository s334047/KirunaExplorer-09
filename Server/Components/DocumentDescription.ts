import dayjs from 'dayjs';
import { Coordinates } from './Georeference.js';

class DocumentDescription{
    title: String
    stakeholder: String
    scale: String
    date: String
    type: String
    language: String
    page: Number
    coordinate: Number[]
    area: String
    description: String

    constructor(title: String, stakeholder: String, scale: String, date: string, type: String, language: String, page: Number, coordinate: Number[], description: String){
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