import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'cm123abc-def4-5678-9012-123456789abc',
  })
  id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Date when the user account was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Date when the user account was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: 'Associated employee information',
    example: null,
    nullable: true,
  })
  employee!: object | null;
}
