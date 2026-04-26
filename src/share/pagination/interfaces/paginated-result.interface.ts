import { IApiResponse } from "src/common/responses/api-response";


export interface IPaginatedResult<T> {
    data: T[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

export type PaginatedResponse<T> = IApiResponse<IPaginatedResult<T>>;