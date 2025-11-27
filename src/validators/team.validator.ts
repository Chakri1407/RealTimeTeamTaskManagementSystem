import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsMongoId,
} from 'class-validator';
import { UserRole } from '../types/enums';

/**
 * DTO for creating a team
 */
export class CreateTeamDto {
  @IsNotEmpty({ message: 'Team name is required' })
  @IsString({ message: 'Team name must be a string' })
  @MinLength(2, { message: 'Team name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Team name cannot exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}

/**
 * DTO for updating a team
 */
export class UpdateTeamDto {
  @IsOptional()
  @IsString({ message: 'Team name must be a string' })
  @MinLength(2, { message: 'Team name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Team name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;
}

/**
 * DTO for adding a team member
 */
export class AddTeamMemberDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'Invalid user ID format' })
  userId!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role?: UserRole;
}

/**
 * DTO for updating team member role
 */
export class UpdateMemberRoleDto {
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Invalid role' })
  role!: UserRole;
} 