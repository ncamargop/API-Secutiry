import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import constants from '../shared/security/constants';
import { UserService } from '../user/user.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  providers: [AuthService, UserService, JwtService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
  imports: [UserModule, PassportModule, JwtModule.register({
    secret: constants.JWT_SECRET,
    signOptions: { expiresIn: constants.JWT_EXPIRES_IN}})]
})
export class AuthModule {}
