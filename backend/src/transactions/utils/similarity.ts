import { Transaction } from '../entities/transaction.entity';

export interface TransactionGroup {
  name: string;
  transactions: Transaction[];
  totalAmount: number;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9#*]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMerchant(description: string): string {
  const normalized = description.toUpperCase();

  const prefixes = [
    'PURCHASE ',
    'POS DEBIT ',
    'POS ',
    'DEBIT CARD ',
    'VISA ',
    'MASTERCARD ',
    'CHECKCARD ',
    'ACH ',
    'ONLINE ',
    'RECURRING ',
  ];

  let cleaned = normalized;
  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length);
    }
  }

  cleaned = cleaned.replace(/\s*(#|REF:?|TRANS:?|ID:?)\s*[\w-]+$/i, '');
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/g, '');
  cleaned = cleaned.replace(/\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/gi, '');

  const parts = cleaned.split(/[-–—]/);
  return parts[0].trim() || description;
}

function calculateSimilarity(a: string, b: string): number {
  const wordsA = new Set(
    normalizeText(a)
      .split(' ')
      .filter((w) => w.length > 2),
  );
  const wordsB = new Set(
    normalizeText(b)
      .split(' ')
      .filter((w) => w.length > 2),
  );

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((x) => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

export function groupSimilarTransactions(
  transactions: Transaction[],
  threshold = 0.6,
): TransactionGroup[] {
  const groups = new Map<string, Transaction[]>();
  const assigned = new Set<string>();

  const sorted = [...transactions].sort((a, b) =>
    extractMerchant(a.description).localeCompare(extractMerchant(b.description)),
  );

  for (const tx of sorted) {
    if (assigned.has(tx.id)) continue;

    const merchant = extractMerchant(tx.description);
    const group: Transaction[] = [tx];
    assigned.add(tx.id);

    for (const other of sorted) {
      if (assigned.has(other.id)) continue;

      const otherMerchant = extractMerchant(other.description);
      const similarity = calculateSimilarity(merchant, otherMerchant);

      if (similarity >= threshold) {
        group.push(other);
        assigned.add(other.id);
      }
    }

    if (group.length >= 2) {
      groups.set(merchant, group);
    }
  }

  const result: TransactionGroup[] = Array.from(groups.entries())
    .map(([name, txs]) => ({
      name,
      transactions: txs,
      totalAmount: txs.reduce((sum, tx) => sum + tx.amount, 0),
    }))
    .sort((a, b) => b.transactions.length - a.transactions.length);

  return result;
}
