export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
}

export function parseCSV(csvText: string): ParseResult {
  const lines = csvText.trim().split('\n');
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = [];

  if (lines.length < 2) {
    errors.push('CSV file must have a header row and at least one data row');
    return { transactions, errors };
  }

  const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());
  const dateIdx = findColumnIndex(header, [
    'date',
    'transaction date',
    'trans date',
    'posted',
  ]);
  const descIdx = findColumnIndex(header, [
    'description',
    'desc',
    'merchant',
    'name',
    'payee',
    'memo',
  ]);
  const amountIdx = findColumnIndex(header, ['amount', 'value', 'sum', 'total']);
  const categoryIdx = findColumnIndex(header, ['category', 'type', 'cat']);

  const debitIdx = findColumnIndex(header, ['debit', 'withdrawal', 'expense']);
  const creditIdx = findColumnIndex(header, ['credit', 'deposit', 'income']);

  if (dateIdx === -1) {
    errors.push(
      'Could not find date column. Expected: date, transaction date, or posted',
    );
  }
  if (descIdx === -1) {
    errors.push(
      'Could not find description column. Expected: description, merchant, or name',
    );
  }
  if (amountIdx === -1 && (debitIdx === -1 || creditIdx === -1)) {
    errors.push(
      'Could not find amount column. Expected: amount, or separate debit/credit columns',
    );
  }

  if (errors.length > 0) {
    return { transactions, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);

      const dateStr = values[dateIdx]?.trim();
      const description = values[descIdx]?.trim();

      let amount: number;
      if (amountIdx !== -1) {
        amount = parseAmount(values[amountIdx]);
      } else {
        const debit = debitIdx !== -1 ? parseAmount(values[debitIdx] || '0') : 0;
        const credit =
          creditIdx !== -1 ? parseAmount(values[creditIdx] || '0') : 0;
        amount = credit - debit;
      }

      const category =
        categoryIdx !== -1 ? values[categoryIdx]?.trim() : undefined;

      if (!dateStr) {
        errors.push(`Row ${i + 1}: Missing date`);
        continue;
      }
      if (!description) {
        errors.push(`Row ${i + 1}: Missing description`);
        continue;
      }
      if (isNaN(amount)) {
        errors.push(`Row ${i + 1}: Invalid amount`);
        continue;
      }

      const date = parseDate(dateStr);
      if (!date) {
        errors.push(`Row ${i + 1}: Invalid date format "${dateStr}"`);
        continue;
      }

      transactions.push({
        date,
        description,
        amount,
        category: category || undefined,
      });
    } catch (e) {
      errors.push(
        `Row ${i + 1}: Failed to parse - ${e instanceof Error ? e.message : 'Unknown error'}`,
      );
    }
  }

  return { transactions, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}

function findColumnIndex(header: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const idx = header.indexOf(name);
    if (idx !== -1) return idx;
  }
  for (const name of possibleNames) {
    const idx = header.findIndex((h) => h.includes(name));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseAmount(amountStr: string): number {
  if (!amountStr) return 0;

  let cleaned = amountStr.replace(/[$€£¥\s]/g, '').trim();

  const isNegative = cleaned.startsWith('(') && cleaned.endsWith(')');
  if (isNegative) {
    cleaned = cleaned.slice(1, -1);
  }

  const hasMinusSign = cleaned.startsWith('-');
  if (hasMinusSign) {
    cleaned = cleaned.slice(1);
  }

  cleaned = cleaned.replace(/,/g, '');

  const amount = parseFloat(cleaned);
  return isNaN(amount) ? NaN : isNegative || hasMinusSign ? -amount : amount;
}

function parseDate(dateStr: string): string | null {
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
  ];

  let match = dateStr.match(formats[0]);
  if (match) {
    return dateStr;
  }

  match = dateStr.match(formats[1]);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  match = dateStr.match(formats[2]);
  if (match) {
    const [, month, day, shortYear] = match;
    const year =
      parseInt(shortYear) > 50 ? `19${shortYear}` : `20${shortYear}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  return null;
}
