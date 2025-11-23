import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { PayloadInterface } from '../../common/interfaces/payload.interface';

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
        //1. verificar correo
        const userByEmail = await this.userService.findUserByEmail(data.email)
        if (!userByEmail) throw new UnauthorizedException(`No existe cuenta asociada al correo ${data.email}`)
        //2. verificar contraseña
        const isPasswordValid = await bcryptjs.compare(data.password, userByEmail.password);
        if (!isPasswordValid) throw new UnauthorizedException(`Contraseña incorrecta`)

        //3. retornar JWT
        //Paylaod: ¿Que datos NO SENSIBLES van a a viajar en el token? 
        const payload: PayloadInterface = {
            id: userByEmail.id,
            email: userByEmail.email,
            username: userByEmail.username,
            isAdmin: userByEmail.admin
        };
        const token = await this.jwtService.signAsync(payload)

        return {
            token: token,
            id_usuario: userByEmail.id_usuario,
            username: userByEmail.username,
            email: userByEmail.email,
            tipo_usuario: userByEmail.tipo_usuario
        }
    }

}


