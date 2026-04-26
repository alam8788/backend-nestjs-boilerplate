import { Module } from '@nestjs/common';
import { PrismaPaginationService } from 'src/share/pagination/services/prisma-pagination.service';

@Module({
  providers: [PrismaPaginationService],
  exports: [PrismaPaginationService],
})
export class CommonForAllModule {}
