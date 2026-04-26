import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../interfaces/paginated-response.interface';

export const ApiPaginatedResponse = <T extends Function>(model: T) => {
    return applyDecorators(
        ApiExtraModels(PaginatedResponseDto, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PaginatedResponseDto) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: { $ref: getSchemaPath(model) },
                            },
                            meta: {
                                type: 'object',
                                properties: {
                                    totalItems: { type: 'number' },
                                    itemCount: { type: 'number' },
                                    itemsPerPage: { type: 'number' },
                                    totalPages: { type: 'number' },
                                    currentPage: { type: 'number' },
                                },
                            },
                        },
                    },
                ],
            },
        }),
    );
};