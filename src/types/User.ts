export interface User {
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WebhookEventLog {
    eventId: string;
    type: string;
    createdAt: Date;
}
