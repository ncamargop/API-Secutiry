import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user';
import constants from 'src/shared/security/constants';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService
    ) {}
 
    async validateUser(username: string, password: string): Promise<any> {
        const user: User | undefined = await this.usersService.findOne(username);
        if (user && user.password === password) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(req: any) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure the authentication guard is applied.');
        }
        const payload = { username: req.user.username, sub: req.user.id };
        return {
            token: this.jwtService.sign(payload, { privateKey: constants.JWT_SECRET }),
        };
    }
 
 }
