# Tutorial completo de seguridad en NestJS
https://misovirtual.virtual.uniandes.edu.co/codelabs/MISW4403_202212_Seguridad/index.html#9

## 1. Instalar paquetes:
``` javascript
npm install --save @nestjs/passport passport passport-local
npm install --save-dev @types/passport-local
npm install --save @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt
```

## 2. Crear clase, modulo y servicio de user:
```javascript
nest g mo user
nest g s user
nest g cl user --no-spec
```

```javascript
export class User {
    id: number;
    username: string;
    password: string;
    roles: string[];

    constructor(id: number, username: string, password: string, roles: string[]) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.roles = roles;
    }
}
/* archivo: src/user/user.ts */
```

```javascript
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
/* archivo: src/user/user.service.ts */
```



## 3. Crear modulo de auth:
```
nest g mo auth
nest g s auth
```

Dentro del módulo de autenticación, se importará el módulo de usuarios, que hemos creado anteriormente; adicionalmente se deben importar los módulos PassportModule y JwtModule.
```javascript
imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: constants.JWT_SECRET,
      signOptions: { expiresIn: constants.JWT_EXPIRES_IN },
    })
  ]
```

Para definir estas constantes que se utilizarán dentro de la este modulo, se definirá un archivo src/shared/security/constants.ts que exporte estas constantes:
```javascript
const jwtConstants = {
    JWT_SECRET: 'secretKey',
    JWT_EXPIRES_IN: '2h',
}

export default jwtConstants;
/* archivo: src/shared/security/constants.ts */
```

Finalizar esta parte implementando AuthService y AuthController.

## 4. Implementar estrategias:
Para definir la estrategia se creará la clase LocalStrategy en la carpeta src/auth/strategies. La implementación de esta estrategia se verá de la siguiente forma:
```javascript
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
 constructor(private authService: AuthService) {
   super();
 }

 async validate(username: string, password: string): Promise<any> {
   const user = await this.authService.validateUser(username, password);
   if (!user) {
     throw new UnauthorizedException();
   }
   return user;
 }
}
/* archivo: src/auth/strategies/local.strategy.ts */
```

La clase JwtStrategy se implementará carpeta src/auth/strategies. La implementación de esta estrategia se verá de la siguiente forma:
```javascript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import constants from '../shared/security/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: constants.JWT_SECRET,
        });
    }
   
    async validate(payload: any) {
        return { id: payload.sub, username: payload.username };
    }
}
/* archivo: src/auth/jwt.strategy.ts */
```

## 5. Implementar guards:
En la carpeta src/auth/guards crearemos los guardias LocalAuthGuard y JwtAuthGuard. Para esto podemos usar los comandos:
``` javascript
nest g gu auth/guards/local-auth --no-spec

nest g gu auth/guards/jwt-auth --no-spec
```

LocalAuthGuard
LocalAuthGuard extiende de la clase AuthGuard aplicando la estrategia local.
```javascript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
/* archivo: src/auth/local-auth.guard.ts */
```

JwtAuthGuard
JwtAuthGuard extiende de la clase AuthGuard aplicando la estrategia jwt.
``` javascript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
/* archivo: src/auth/jwt-auth.guard.ts */
```

## 6. Implementamos el metodo login:
```javascript
...    
async login(req: any) {
        const payload = { name: req.user.username, sub: req.user.id };
        return {
            token: this.jwtService.sign(payload, { privateKey: constants.JWT_SECRET }),
        };
    }
...
/* archivo: src/auth/auth.service.ts */
```

```javascript
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {

   constructor(private readonly authService: AuthService){}
   @UseGuards(LocalAuthGuard)
   @Post('login')
   async login(@Req() req) {
       return this.authService.login(req);
   }
}
/* archivo: src/users/user.controller.ts */
```


# Finalmente usar el JwtAuthGuard como decorador
Luego de implementado todo lo del tutorial (auth, login, users, guards, etc.) solo debemos agregar el decordador `@UseGuards(JwtAuthGuard)` a la ruta(s) que queremos proteger en el controlador. Por ejemplo:

```javascript
...
@UseGuards(JwtAuthGuard)
@Post()
@HttpCode(201)
 async create(@Body() artworkDto: ArtworkDto) {
   const artwork = plainToInstance(ArtworkEntity, artworkDto);
   return await this.artworkService.create(artwork);
 }
...
/* archivo: src/artwork/artwork.controller.ts */
```

# NestJS docs
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
