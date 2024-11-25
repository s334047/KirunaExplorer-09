export default class Resource {
    id: Number
    path: string
    docId: Number

    constructor(id: Number, path: string, docId: Number){
        this.id = id
        this.path = path
        this.docId = docId
    }
}