import { Injectable } from '@nestjs/common';
import { User } from './user';

@Injectable()
export class UserService {
    private users: User[] = [
        new User(1, "admin", "admin", ["admin"]),
        new User(2, "user", "admin", ["user"]),
    ];
 
    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }
 }
