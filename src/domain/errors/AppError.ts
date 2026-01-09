export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Message quota exceeded') {
    super(message, 429, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

export class SubscriptionRequiredError extends AppError {
  constructor(message: string = 'Valid subscription bundle required') {
    super(message, 402, 'SUBSCRIPTION_REQUIRED');
    this.name = 'SubscriptionRequiredError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class InactiveSubscriptionError extends AppError {
  constructor(message: string = 'Subscription is inactive') {
    super(message, 403, 'INACTIVE_SUBSCRIPTION');
    this.name = 'InactiveSubscriptionError';
  }
}
