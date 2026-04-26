import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: { database: { status: 'up' } } })
  info!: Record<string, any>;

  @ApiProperty({ example: { database: { status: 'up' } } })
  details!: Record<string, any>;

  @ApiProperty({ example: 1630000000000, required: false })
  timestamp?: number;
}
