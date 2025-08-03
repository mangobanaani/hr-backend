import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message or array of validation errors',
    oneOf: [
      { type: 'string', example: 'Invalid credentials' },
      {
        type: 'array',
        items: { type: 'string' },
        example: ['email must be a valid email', 'password is required'],
      },
    ],
  })
  message!: string | string[];

  @ApiProperty({
    description: 'Error type identifier',
    example: 'Bad Request',
  })
  error!: string;
}

export class UnauthorizedResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Unauthorized',
  })
  message!: string;
}
