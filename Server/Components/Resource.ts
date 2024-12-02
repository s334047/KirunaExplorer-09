export default class Resource {
    id: number
    path: string
    docId: number

    constructor(id: number, path: string, docId: number){
        this.id = id
        this.path = path
        this.docId = docId
    }
}