import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @ApiProperty({
        example: 'correo@ejemplo.com',
        description: 'Correo electrónico o nombre de usuario (username) del usuario.',
    })
    @Transform(({ value }) => value.trim())
    @IsNotEmpty({ message: 'El identificador no debe estar vacío.' })
    @IsString({ message: 'El identificador debe ser una cadena de texto.' })
    @Length(3, 255, { message: 'El identificador debe tener entre 3 y 255 caracteres.' })
    identifier: string; // 👈 Nuevo campo unificado

    @ApiProperty({ example: '12345678', description: 'Contraseña del usuario', minLength: 8 })
    @Transform(({ value }) => value.trim())
    @IsNotEmpty({ message: 'La contraseña no debe estar vacía.' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Length(8, 255, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    password: string;
}