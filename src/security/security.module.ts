import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // limit each IP to 10 requests per ttl
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 100, // limit each IP to 100 requests per ttl
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 500, // limit each IP to 500 requests per ttl
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class SecurityModule {}
