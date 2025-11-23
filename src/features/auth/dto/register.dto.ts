import {
  IsString,
  IsEmail,
  Length,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/*Es el mismo DTO que create-user.dto.ts*/
export class RegisterDto{
  @ApiProperty({
    example: 'correo@ejemplo.com',
    description: 'Correo electrónico válido y único',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'juan123',
    description: 'Nombre de usuario (mínimo 5, máximo 20 caracteres)',
    minLength: 5,
    maxLength: 20,
  })
  @IsNotEmpty()
  @Length(5, 20)
  @Transform(({value}) => value.trim())
  @IsString()
  username: string;

  @ApiProperty({
    example: '12345678',
    description: 'Contraseña (mínimo 8 caracteres, es encriptada en el backend)',
    minLength: 8,
    maxLength: 255,
  })
  @Transform(({value}) => value.trim())
  @IsString()
  @Length(8, 255)
  password: string;

}