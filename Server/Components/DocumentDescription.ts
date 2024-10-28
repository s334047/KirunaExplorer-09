class DocumentDescription{
    title: string
    stakeholder: string
    scale: string
    date: string
    type: string
    language: string
    page: number
    coordinate: string
    area: string
    description: string

    constructor(title: string, stakeholder: string, scale: string, date: string, type: string, language: string, page: number, coordinate: string, area: string, description: string){
        this.title = title,
        this.stakeholder = stakeholder,
        this.scale = scale,
        this.date = date,
        this.type = type,
        this.language = language,
        this.page = page,
        this.coordinate = coordinate,
        this.area = area,
        this.description = description
    }
}

export {DocumentDescription};