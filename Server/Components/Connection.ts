export class Connection {
    SourceDocId: number
    TargetDocId: number
    Type: string

    constructor(SourceDocId: number, TargetDocId: number, Type: string){
        this.SourceDocId = SourceDocId
        this.TargetDocId = TargetDocId
        this.Type = Type
    }
}