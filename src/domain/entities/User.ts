export interface User {
  id: number;
  email: string;
  name: string;
  freeMessagesUsed: number;
  freeMessagesResetDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  name: string;
}
