import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Permite usar UsersService dentro de AuthService
    UsersModule,

    // Configuración de JWT de manera asíncrona usando variables de entorno
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa ConfigModule para poder usar ConfigService
      inject: [ConfigService], // Inyecta ConfigService
      useFactory: (config: ConfigService) => ({
        global: true, // JWTModule disponible globalmente
        secret: config.get<string>('JWT_SECRET'), // Obtiene el secret desde .env
        signOptions: {
          expiresIn: parseInt(config.get<string>('JWT_EXPIRES_IN') || '3600', 10), // 3600 segundos
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule], // Permite usar AuthService y JwtModule en otros módulos
})
export class AuthModule { }
