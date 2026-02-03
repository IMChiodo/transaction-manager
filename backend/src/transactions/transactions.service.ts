import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { Transaction } from './entities/transaction.entity';
import {
  UpdateTransactionDto,
  BulkUpdateDto,
  FilterTransactionsDto,
  ImportTransactionDto,
} from './dto';
import { parseCSV, ParseResult } from './utils/csv-parser';
import {
  groupSimilarTransactions,
  TransactionGroup,
} from './utils/similarity';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionsService implements OnModuleInit {
  private transactions: Transaction[] = [];
  private readonly dataPath = path.join(
    process.cwd(),
    'data',
    'transactions.json',
  );

  async onModuleInit(): Promise<void> {
    await this.loadTransactions();
  }

  private async loadTransactions(): Promise<void> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.transactions = JSON.parse(data);
    } catch {
      console.error('Failed to load transactions, starting with empty array');
      this.transactions = [];
    }
  }

  private async saveTransactions(): Promise<void> {
    await fs.writeFile(
      this.dataPath,
      JSON.stringify(this.transactions, null, 2),
      'utf-8',
    );
  }

  async findAll(filters?: FilterTransactionsDto): Promise<Transaction[]> {
    let result = [...this.transactions];

    if (filters) {
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        result = result.filter((tx) => new Date(tx.date) >= start);
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        result = result.filter((tx) => new Date(tx.date) <= end);
      }

      if (filters.category) {
        const categories = filters.category.split(',').map((c) => c.trim());
        result = result.filter(
          (tx) => tx.category && categories.includes(tx.category),
        );
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (tx) =>
            tx.description.toLowerCase().includes(query) ||
            tx.category?.toLowerCase().includes(query),
        );
      }
      
      const sortBy = filters.sortBy || 'date';
      const sortDir = filters.sortDir || 'desc';
      const multiplier = sortDir === 'asc' ? 1 : -1;

      result.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'date':
            comparison =
              new Date(a.date).getTime() - new Date(b.date).getTime();
            break;
          case 'description':
            comparison = a.description.localeCompare(b.description);
            break;
          case 'amount':
            comparison = a.amount - b.amount;
            break;
          case 'category':
            comparison = (a.category || '').localeCompare(b.category || '');
            break;
        }

        return comparison * multiplier;
      });
    }

    return result;
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = this.transactions.find((tx) => tx.id === id);

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(
    id: string,
    updateDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const index = this.transactions.findIndex((tx) => tx.id === id);

    if (index === -1) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    this.transactions[index] = {
      ...this.transactions[index],
      ...updateDto,
    };

    await this.saveTransactions();

    return this.transactions[index];
  }

  async bulkUpdate(bulkUpdateDto: BulkUpdateDto): Promise<Transaction[]> {
    const { ids, category } = bulkUpdateDto;
    const idSet = new Set(ids);
    const updated: Transaction[] = [];

    this.transactions = this.transactions.map((tx) => {
      if (idSet.has(tx.id)) {
        const updatedTx = { ...tx, category };
        updated.push(updatedTx);
        return updatedTx;
      }
      return tx;
    });

    await this.saveTransactions();

    return updated;
  }

  async importTransactions(
    importDtos: ImportTransactionDto[],
  ): Promise<{ imported: number; duplicates: number; total: number }> {
    const existingKeys = new Set(
      this.transactions.map((tx) =>
        `${tx.date}|${tx.description}|${tx.amount}`.toLowerCase(),
      ),
    );

    let imported = 0;
    let duplicates = 0;

    for (const dto of importDtos) {
      const key = `${dto.date}|${dto.description}|${dto.amount}`.toLowerCase();

      if (existingKeys.has(key)) {
        duplicates++;
        continue;
      }

      const newTransaction: Transaction = {
        id: randomUUID(),
        date: dto.date,
        description: dto.description,
        amount: dto.amount,
        category: dto.category || undefined,
      };

      this.transactions.push(newTransaction);
      existingKeys.add(key);
      imported++;
    }

    if (imported > 0) {
      this.transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      await this.saveTransactions();
    }

    return {
      imported,
      duplicates,
      total: this.transactions.length,
    };
  }

  async importFromCsv(
    csvContent: string,
  ): Promise<{ imported: number; duplicates: number; total: number; errors: string[] }> {
    const parseResult: ParseResult = parseCSV(csvContent);

    if (
      parseResult.transactions.length === 0 &&
      parseResult.errors.length > 0
    ) {
      throw new BadRequestException({
        message: 'Failed to parse CSV',
        errors: parseResult.errors,
      });
    }

    const importResult = await this.importTransactions(parseResult.transactions);

    return {
      ...importResult,
      errors: parseResult.errors,
    };
  }

  async exportTransactions(filters?: FilterTransactionsDto): Promise<string> {
    const transactions = await this.findAll(filters);

    const headers = ['date', 'description', 'amount', 'category'];
    const rows = transactions.map((tx) => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`, 
      tx.amount.toString(),
      tx.category ? `"${tx.category.replace(/"/g, '""')}"` : '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  getSimilarGroups(): TransactionGroup[] {
    const uncategorized = this.transactions.filter((tx) => !tx.category);
    return groupSimilarTransactions(uncategorized);
  }
}
