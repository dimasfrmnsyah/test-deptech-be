import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @IsString() @MaxLength(100) firstName!: string;
  @IsString() @MaxLength(100) lastName!: string;
  @IsEmail() email!: string;

  @IsOptional() @IsDateString() birthDate?: string;
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value ?? new Date().toISOString().split('T')[0])
  dateJoin?: string;
  @IsOptional() @IsIn(['L', 'P']) gender?: 'L' | 'P';
  @IsOptional() @IsString() @MaxLength(20) phone?: string;
  @IsOptional() @IsString() @MaxLength(255) address?: string;

  @IsString() @MinLength(6) password!: string;
  @IsString() @MinLength(6) confirmPassword!: string;
}
