import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class FilterTransactionsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['date', 'description', 'amount', 'category'])
  sortBy?: 'date' | 'description' | 'amount' | 'category';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}
