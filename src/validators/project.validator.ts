import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsEnum,
} from 'class-validator';

/**
 * DTO for creating a project
 */
export class CreateProjectDto {
  @IsNotEmpty({ message: 'Project name is required' })
  @IsString({ message: 'Project name must be a string' })
  @MinLength(2, { message: 'Project name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @IsNotEmpty({ message: 'Team ID is required' })
  @IsMongoId({ message: 'Invalid team ID format' })
  team!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsEnum(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], {
    message: 'Invalid status',
  })
  status?: string;
}

/**
 * DTO for updating a project
 */
export class UpdateProjectDto {
  @IsOptional()
  @IsString({ message: 'Project name must be a string' })
  @MinLength(2, { message: 'Project name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Project name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  endDate?: string;

  @IsOptional()
  @IsEnum(['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], {
    message: 'Invalid status',
  })
  status?: string;
} 