export class User {
  id: number;
  name: string;
  salt: string;
  hash: string;
  token: string;
}

export type UserError =
  | 'wrong-credentials'
  | 'name-exists'
  | 'empty-credentials'
  | 'no-user'
  | 'empty-new-username'
  | 'empty-new-password'
  | 'wrong-current-password'
  | 'wrong-new-password'
  | 'same-password'
  | 'same-name';
