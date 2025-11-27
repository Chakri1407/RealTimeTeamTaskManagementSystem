import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../types/enums';

/**
 * DTO for pagination query parameters
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort field must be a string' })
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'], { message: 'Sort order must be "asc" or "desc"' })
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO for task filtering
 */
export class TaskFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid task priority' })
  priority?: TaskPriority;

  @IsOptional()
  @IsString({ message: 'Assigned to must be a valid ID' })
  assignedTo?: string;

  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;
}

/**
 * DTO for MongoDB ID parameter
 */
export class MongoIdDto {
  @IsString({ message: 'ID must be a string' })
  id!: string;
} 