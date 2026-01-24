import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';
import {
  PaginatedResponse,
  CursorPaginatedResponse,
} from '../interfaces/paginated-response.interface';

@Injectable()
export class PaginationHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<Response>();
        const request = context.switchToHttp().getRequest();

        // Handle offset-based pagination
        if (this.isPaginatedResponse(data)) {
          const { pagination } = data;

          response.setHeader('X-Total-Count', pagination.total.toString());
          response.setHeader('X-Page', pagination.page.toString());
          response.setHeader('X-Per-Page', pagination.limit.toString());
          response.setHeader('X-Total-Pages', pagination.totalPages.toString());

          // Build Link header for navigation
          const links = this.buildLinkHeader(
            request.url,
            pagination.page,
            pagination.totalPages,
            pagination.limit,
          );
          if (links) {
            response.setHeader('Link', links);
          }
        }

        // Handle cursor-based pagination
        if (this.isCursorPaginatedResponse(data)) {
          const { pagination } = data;

          if (pagination.nextCursor !== undefined && pagination.nextCursor !== null) {
            response.setHeader('X-Next-Cursor', pagination.nextCursor);
          }
          if (pagination.hasNext !== undefined) {
            response.setHeader('X-Has-More', pagination.hasNext.toString());
          }
        }

        return data;
      }),
    );
  }

  private isPaginatedResponse(data: any): data is PaginatedResponse<any> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      'pagination' in data &&
      typeof data.pagination === 'object' &&
      'total' in data.pagination &&
      'page' in data.pagination &&
      'limit' in data.pagination
    );
  }

  private isCursorPaginatedResponse(
    data: any,
  ): data is CursorPaginatedResponse<any> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      'pagination' in data &&
      typeof data.pagination === 'object' &&
      'nextCursor' in data.pagination
    );
  }

  private buildLinkHeader(
    url: string,
    currentPage: number,
    totalPages: number,
    limit: number,
  ): string | null {
    const baseUrl = url.split('?')[0];
    const links: string[] = [];

    // First page
    if (currentPage > 1) {
      links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"`);
    }

    // Previous page
    if (currentPage > 1) {
      links.push(
        `<${baseUrl}?page=${currentPage - 1}&limit=${limit}>; rel="prev"`,
      );
    }

    // Next page
    if (currentPage < totalPages) {
      links.push(
        `<${baseUrl}?page=${currentPage + 1}&limit=${limit}>; rel="next"`,
      );
    }

    // Last page
    if (currentPage < totalPages) {
      links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);
    }

    return links.length > 0 ? links.join(', ') : null;
  }
}
