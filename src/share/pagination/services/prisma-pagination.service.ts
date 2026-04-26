import { Injectable, BadRequestException } from '@nestjs/common';
import { PaginationParamsDto } from '../dto/pagination-params.dto';
import { Prisma } from 'prisma/generated/client';

@Injectable()
export class PrismaPaginationService {
  async paginate<
    T,
    Model extends {
      count: (args: any) => Prisma.PrismaPromise<number>;
      findMany: (args: any) => Prisma.PrismaPromise<T[]>;
    },
    WhereInput = any,
    IncludeInput = any,
  >(
    model: Model,
    paginationParams: PaginationParamsDto,
    options: {
      where?: WhereInput;
      include?: IncludeInput;
      select?: any;
      defaultSort?: Record<string, 'asc' | 'desc'>;
      searchableFields?: string[];
    } = {},
  ): Promise<{ data: T[]; meta: any }> {
    // 1. Set sensible defaults during destructuring to avoid 'undefined'
    const { page, limit, sortOrder, search, isActive } = paginationParams;

    let typeChangeIsActive: boolean | undefined;
    if (isActive === 'true') typeChangeIsActive = true;
    if (isActive === 'false') typeChangeIsActive = false;

    const {
      where = {},
      include,
      select,
      defaultSort = { createdAt: 'desc' },
      searchableFields = [],
    } = options;

    // 2. Check if pagination is actually requested
    const shouldPaginate = page !== undefined && limit !== undefined;

    if (shouldPaginate) {
      this.validatePaginationParams({ page, limit });
    }

    const searchWhere =
      search && searchableFields.length > 0
        ? this.buildSearchWhere(search, searchableFields)
        : {};

    const isActiveWhere =
      typeof typeChangeIsActive === 'boolean'
        ? { isActive: typeChangeIsActive }
        : {};

    const finalWhere = { ...where, ...isActiveWhere, ...searchWhere };

    const totalItems = await model.count({ where: finalWhere });

    // 3. Handle calculations safely
    // We use fallback values (1 for page, totalItems for limit) if not paginating
    const safePage = page ?? 1;
    const safeLimit = limit ?? totalItems;

    const totalPages = shouldPaginate
      ? Math.ceil(totalItems / safeLimit) || 1
      : 1;
    const currentPage = shouldPaginate ? Math.min(safePage, totalPages) : 1;

    const orderBy = this.buildOrderBy(defaultSort, sortOrder);

    const data = await model.findMany({
      where: finalWhere,
      include,
      select,
      orderBy,
      // 4. Using ternary to ensure skip/take receive number | undefined correctly
      skip: shouldPaginate ? (safePage - 1) * safeLimit : undefined,
      take: shouldPaginate ? safeLimit : undefined,
    });

    return {
      data,
      meta: {
        totalItems,
        itemCount: data.length,
        itemsPerPage: shouldPaginate ? safeLimit : totalItems,
        totalPages,
        currentPage,
        hasPagination: shouldPaginate,
      },
    };
  }

  private buildSearchWhere(
    searchTerm: string,
    searchableFields: string[],
  ): Record<string, any> {
    const cleanedTerm = searchTerm.trim();
    if (!cleanedTerm || searchableFields.length === 0) return {};

    const conditions = searchableFields.map((field) => {
      if (field.includes('.')) {
        const [relation, property] = field.split('.');
        return {
          [relation]: {
            [property]: {
              contains: cleanedTerm,
              mode: 'insensitive',
            },
          },
        };
      }
      return {
        [field]: {
          contains: cleanedTerm,
          mode: 'insensitive',
        },
      };
    });

    return { OR: conditions };
  }

  private buildOrderBy(
    defaultSort: Record<string, 'asc' | 'desc'>,
    sortOrder?: string,
  ): Record<string, 'asc' | 'desc'>[] {
    const direction = this.validateSortDirection(sortOrder);
    const orderedSort: Record<string, 'asc' | 'desc'> = {};

    for (const key of Object.keys(defaultSort)) {
      orderedSort[key] = direction;
    }

    return [orderedSort];
  }

  private validateSortDirection(direction?: string): 'asc' | 'desc' {
    if (!direction) return 'desc';
    const normalized = direction.trim().toLowerCase();
    return normalized === 'asc' || normalized === 'desc' ? normalized : 'desc';
  }

  private validatePaginationParams(params: { page: number; limit: number }) {
    if (params.limit <= 0)
      throw new BadRequestException('Limit must be greater than 0');
    if (params.page <= 0)
      throw new BadRequestException('Page must be greater than 0');
  }
}
