import { IsString, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsString()
  @IsOptional()
  category?: string;
}
