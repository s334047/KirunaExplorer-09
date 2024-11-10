import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);


class DocumentDescription {
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

    constructor(id: number, title: string, stakeholder: string, scale: string, date: string, type: string, language: string, page: number, coordinate: number[], area: number[][], description: string) {
        this.id = id;
        this.title = title;
        this.stakeholder = stakeholder;
        this.scale = scale;

        let parsedDate;
        if (dayjs(date, 'DD/MM/YYYY', true).isValid()) {
            parsedDate = dayjs(date, 'DD/MM/YYYY');
            this.date = parsedDate.format('DD-MM-YYYY');
        } else if (dayjs(date, 'YYYY', true).isValid()) {
            parsedDate = dayjs(date, 'YYYY');
            this.date = parsedDate.format('YYYY');
        } else {
            this.date = 'Invalid Date';
            console.warn(`Invalid date format for input: ${date}`);
        }

        console.log(this.date)
        this.type = type,
            this.language = language,
            this.page = page,
            this.coordinate = coordinate,
            this.area = area,
            this.description = description
    }
}

export { DocumentDescription };