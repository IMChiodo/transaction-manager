import { IsArray, ValidateNested, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportTransactionDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  category?: string;
}

export class ImportTransactionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportTransactionDto)
  transactions: ImportTransactionDto[];
}
