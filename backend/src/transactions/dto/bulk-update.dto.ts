import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class BulkUpdateDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  ids: string[];

  @IsString()
  category: string;
}
