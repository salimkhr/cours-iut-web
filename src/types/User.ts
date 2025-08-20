import {ObjectId} from "bson";

export type UserRole = 'admin' | 'student';

export default interface User {
    _id?: string | ObjectId;
    lastName: string; // Nom
    firstName: string; // Prénom
    email: string;
    role: UserRole;
    extraTime: boolean; // Tiers temps
    scodocId?: string; // identifiant externe
}
