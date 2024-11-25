export class Connection {
    SourceDocId: Number
    TargetDocId: Number
    Type: String

    constructor(SourceDocId: Number, TargetDocId: Number, Type: String){
        this.SourceDocId = SourceDocId
        this.TargetDocId = TargetDocId
        this.Type = Type
    }
}