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
    // Identifiant de connexion: exactement 2 lettres puis 6 chiffres (ex: ab123456)
    login?: string;
    // Groupe de l'utilisateur: 'F' ou 'G'
    groupe?: string;
}
