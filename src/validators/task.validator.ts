import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsMongoId,
  IsDateString,
  IsEnum,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../types/enums';

/**
 * DTO for creating a task
 */
export class CreateTaskDto {
  @IsNotEmpty({ message: 'Task title is required' })
  @IsString({ message: 'Task title must be a string' })
  @MinLength(3, { message: 'Task title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Task title cannot exceed 200 characters' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsNotEmpty({ message: 'Project ID is required' })
  @IsMongoId({ message: 'Invalid project ID format' })
  project!: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid assignee ID format' })
  assignedTo?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid task priority' })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  tags?: string[];
}

/**
 * DTO for updating a task
 */
export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'Task title must be a string' })
  @MinLength(3, { message: 'Task title must be at least 3 characters long' })
  @MaxLength(200, { message: 'Task title cannot exceed 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid assignee ID format' })
  assignedTo?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Invalid task priority' })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid date' })
  dueDate?: string;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  @ArrayMaxSize(10, { message: 'Cannot have more than 10 tags' })
  tags?: string[];
}

/**
 * DTO for updating task status
 */
export class UpdateTaskStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status!: TaskStatus;
}

/**
 * DTO for assigning task
 */
export class AssignTaskDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'Invalid user ID format' })
  userId!: string;
} 