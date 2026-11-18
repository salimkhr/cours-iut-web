export default interface AdminUser {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    role: string;
    group?: string | null;
    username?: string | null;
    extraTime?: boolean;
    banned?: boolean | null;
    createdAt: string;
}
