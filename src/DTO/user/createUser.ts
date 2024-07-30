import { IsDateString, IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsDateString()
  dateOfBirth: Date;

  @IsString()
  role: string;
}
