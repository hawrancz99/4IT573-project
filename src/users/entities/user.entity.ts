export class User {
    id: number;
    name: string;
    salt: string;
    hash: string;
    token: string;
}

export type UserError = 'wrong-credentials';

