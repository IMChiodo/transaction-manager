import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Res,
  Header,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { TransactionsService } from './transactions.service';
import {
  UpdateTransactionDto,
  BulkUpdateDto,
  FilterTransactionsDto,
  ImportTransactionsDto,
} from './dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Query() filters: FilterTransactionsDto) {
    return this.transactionsService.findAll(filters);
  }

  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="transactions.csv"')
  async exportTransactions(
    @Query() filters: FilterTransactionsDto,
    @Res() res: Response,
  ) {
    const csv = await this.transactionsService.exportTransactions(filters);
    res.send(csv);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateDto);
  }

  @Post('bulk')
  async bulkUpdate(@Body() bulkUpdateDto: BulkUpdateDto) {
    return this.transactionsService.bulkUpdate(bulkUpdateDto);
  }

  @Get('groups/similar')
  getSimilarGroups() {
    return this.transactionsService.getSimilarGroups();
  }

  @Post('import')
  async importTransactions(@Body() importDto: ImportTransactionsDto) {
    return this.transactionsService.importTransactions(importDto.transactions);
  }

  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  async importFromCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('File must be a CSV');
    }

    const csvContent = file.buffer.toString('utf-8');
    return this.transactionsService.importFromCsv(csvContent);
  }
}
