export interface Content {
    _id: string | ObjectId;
    type: 'cours' | 'TP' | 'projet' | 'examen';
    componentPath: string;
}