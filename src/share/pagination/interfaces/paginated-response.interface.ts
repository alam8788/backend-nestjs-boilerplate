import { ApiProperty } from '@nestjs/swagger';

export interface IPaginatedResponse<T> {
    data: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export class PaginatedResponseDto<T> {
    @ApiProperty()
    data: T[];

    @ApiProperty()
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        currentPage: number;
        perPage: number;
        lastPage: number;
    };
}

export interface PaginationOptions {
    page: number;
    perPage: number;
    search?: string;
    sort?: string;
}
