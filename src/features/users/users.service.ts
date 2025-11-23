import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from '../auth/dto/register.dto';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';




@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

    async getAllUsers(){
    try {
      const usersList = await this.prisma.user.findMany();
      return usersList;
    } catch (error) {
      throw new BadRequestException(`Hubo un problema al obtener la lista de usuarios. Por favor, intente nuevamente más tarde.${error}`);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!email || email.trim() === '') return null;

    return this.prisma.user.findUnique({
      where: { email: email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    if (!username || username.trim() === '') return null;

    return this.prisma.user.findUnique({
      where: { username:username },
    });
  }


  async createUser(data: RegisterDto): Promise<User> {
    try {
      const userCreated = await this.prisma.user.create({
        data: {
          ...data, //(email,username,password)
          admin: false,
          createdAt: new Date(),
        },
      });
      return userCreated;
    } catch (error: any) {
      // Prisma error: unique constraint
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Ya existe un usuario con ese correo.');
      }
      if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
        throw new BadRequestException('Ya existe un usuario con ese username.');
      }
      throw new BadRequestException('Hubo un problema al crear el usuario. Por favor, intente nuevamente.');
    }
  }


}
