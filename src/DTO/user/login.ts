import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  usernameLogin: string;

  @IsString()
  password: string;
}
