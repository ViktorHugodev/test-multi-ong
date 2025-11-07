import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsEnum(['admin', 'ong_manager', 'ong_staff', 'customer'])
  role?: 'admin' | 'ong_manager' | 'ong_staff' | 'customer';

  @IsOptional()
  @IsString()
  organizationId?: string;
}
