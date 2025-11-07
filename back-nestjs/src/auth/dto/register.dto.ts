import { IsEmail, IsString, MinLength, IsOptional, IsEnum, ValidateNested, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class OrganizationDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  @Length(0, 1000)
  description?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @Length(3, 100)
  fullName: string;

  @IsEnum(['admin', 'ong_manager', 'ong_staff', 'customer'])
  role: 'admin' | 'ong_manager' | 'ong_staff' | 'customer';

  @IsOptional()
  @IsString()
  organizationId?: string;

  @ValidateNested()
  @Type(() => OrganizationDto)
  @IsOptional()
  organization?: OrganizationDto;
}
