import { Module } from '@nestjs/common';
import { PrismaPaginationService } from './services/prisma-pagination.service';

@Module({
    providers: [PrismaPaginationService],
    exports: [PrismaPaginationService],
})
export class PaginationModule { }