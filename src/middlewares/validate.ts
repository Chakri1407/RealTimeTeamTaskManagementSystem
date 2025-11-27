import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationError } from '../utils/errors';

/**
 * Validation middleware factory
 * Validates request body against a DTO class
 */
export const validateRequest = (dtoClass: any, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dtoInstance = plainToClass(dtoClass, req[source]);

      // Validate
      const errors = await validate(dtoInstance as object, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
      });

      if (errors.length > 0) {
        // Format validation errors
        const formattedErrors = errors.map((error: ClassValidatorError) => ({
          field: error.property,
          constraints: error.constraints,
          value: error.value,
        }));

        throw new ValidationError('Validation failed', formattedErrors);
      }

      // Replace request data with validated DTO instance
      req[source] = dtoInstance;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate multiple sources (body, query, params)
 */
export const validateMultiple = (validators: {
  body?: any;
  query?: any;
  params?: any;
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const allErrors: any[] = [];

      // Validate body
      if (validators.body) {
        const bodyInstance = plainToClass(validators.body, req.body);
        const bodyErrors = await validate(bodyInstance as object, {
          whitelist: true,
          forbidNonWhitelisted: true,
        });

        if (bodyErrors.length > 0) {
          allErrors.push(
            ...bodyErrors.map((error) => ({
              source: 'body',
              field: error.property,
              constraints: error.constraints,
            }))
          );
        } else {
          req.body = bodyInstance;
        }
      }

      // Validate query
      if (validators.query) {
        const queryInstance = plainToClass(validators.query, req.query);
        const queryErrors = await validate(queryInstance as object);

        if (queryErrors.length > 0) {
          allErrors.push(
            ...queryErrors.map((error) => ({
              source: 'query',
              field: error.property,
              constraints: error.constraints,
            }))
          );
        } else {
          req.query = queryInstance as any;
        }
      }

      // Validate params
      if (validators.params) {
        const paramsInstance = plainToClass(validators.params, req.params);
        const paramsErrors = await validate(paramsInstance as object);

        if (paramsErrors.length > 0) {
          allErrors.push(
            ...paramsErrors.map((error) => ({
              source: 'params',
              field: error.property,
              constraints: error.constraints,
            }))
          );
        } else {
          req.params = paramsInstance as any;
        }
      }

      if (allErrors.length > 0) {
        throw new ValidationError('Validation failed', allErrors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 