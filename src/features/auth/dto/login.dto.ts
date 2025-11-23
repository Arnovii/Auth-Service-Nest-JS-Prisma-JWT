import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length,IsOptional } from "class-validator";


export class LoginDto {
    @ApiProperty({ example: 'admin@ejemplo.com', description: 'Correo del usuario' })
    @IsEmail()
    @IsOptional()
    email: string;

    @Transform(({value}) => value.trim())
    @IsOptional()
    @IsString()
    @Length(5, 20)
    username: string;

    @ApiProperty({ example: '12345678', description: 'Contraseña del usuario', minLength: 8})
    @Transform(({ value }) => value.trim())
    @IsNotEmpty()
    @IsString()
    @Length(8, 255)
    password: string;
}
