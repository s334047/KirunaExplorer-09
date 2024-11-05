import dayjs from 'dayjs';

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
    area: string
    description: string

    constructor(id: number, title: string, stakeholder: string, scale: string, date: string, type: string, language: string, page: number, coordinate: number[], description: string){
        this.id = id;
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