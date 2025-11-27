import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  metadata?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

class ResponseFormatter {
  /**
   * Success response
   */
  success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200,
    metadata?: ApiResponse['metadata']
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      metadata,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   */
  created<T>(res: Response, message: string, data?: T): Response {
    return this.success(res, message, data, 201);
  }

  /**
   * Error response
   */
  error(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || undefined,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response
   */
  validationError(res: Response, errors: any[]): Response {
    return res.status(422).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  /**
   * Paginated response
   */
  paginated<T>(
    res: Response,
    message: string,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const totalPages = Math.ceil(total / limit);

    return this.success(res, message, data, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }

  /**
   * No content response (204)
   */
  noContent(res: Response): Response {
    return res.status(204).send();
  }
}

export default new ResponseFormatter(); 