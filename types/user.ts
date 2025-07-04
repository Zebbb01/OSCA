export type User = {
    username: string;
    email: string;
    role: 'USER' | 'ADMIN'; // Add the role property
}