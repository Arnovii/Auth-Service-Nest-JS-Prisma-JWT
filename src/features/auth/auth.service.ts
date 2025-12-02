import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { PayloadInterface } from '../../common/interfaces/payload.interface';
import { User } from '@prisma/client'
import { isEmail } from 'class-validator';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService // <-- para leer variables de entorno
    ) { }

    async register(data: RegisterDto) {
        try {
            //verifications
            const userByEmail = await this.userService.findUserByEmail(data.email)
            if (userByEmail) throw new BadRequestException("Ya existe un usuario con ese correo.")

            const userByUsername = await this.userService.findUserByUsername(data.username)
            if (userByUsername) throw new BadRequestException("Ya existe un usuario con ese username.")

            //hashing password
            data.password = await bcryptjs.hash(data.password, 10)

            //creating user
            const userCreated = await this.userService.createUser(data)

            return { message: `Se ha creado el usuario ${userCreated.username} con correo ${userCreated.email}` };

        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            // Prisma error: unique constraint
            if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
                throw new BadRequestException('Ya existe un usuario con ese correo.');
            }
            if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
                throw new BadRequestException('Ya existe un usuario con ese username.');
            }
            throw new BadRequestException('El usuario no se ha podido registrar. Por favor, intente nuevamente.');
        }
    }

    async login(data: LoginDto) {
        let user: User | null = null;
        const { identifier, password } = data; // Desestructuramos para mayor claridad

        // 1️⃣ Determinar si es un correo o un username
        const isEmailFormat = isEmail(identifier); // Utilizamos la función para verificar el formato de correo

        if (isEmailFormat) {
            // Intenta buscar por correo electrónico
            user = await this.userService.findUserByEmail(identifier);
        }

        if (!user) {
            // Si no se encontró por correo (o si no tenía formato de correo),
            // intenta buscar por nombre de usuario (username)
            user = await this.userService.findUserByUsername(identifier);
        }

        // ⚠️ Validación final: Si no se encontró en ninguna de las dos formas
        if (!user) {
            throw new UnauthorizedException(`No existe cuenta asociada al identificador: ${identifier}`);
        }

        // 2️⃣ Verificar contraseña
        const isPasswordValid = await bcryptjs.compare(data.password, user.password);
        if (!isPasswordValid) throw new UnauthorizedException(`Contraseña incorrecta`);

        // 3️⃣ Retornar JWT
        const payload: PayloadInterface = {
            id: user.id,
            email: user.email,
            username: user.username,
            admin: user.admin,
        };

        const token = await this.jwtService.signAsync(payload);

        return {
            token,
            username: user.username,
            email: user.email,
            admin: user.admin,
        };
    }


}


