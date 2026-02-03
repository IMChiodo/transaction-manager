import { Injectable } from '@nestjs/common';

const CATEGORY_RULES = new Map<string, string>([
  // Coffee
  ['starbucks', 'Coffee'],
  ['coffee bean', 'Coffee'],
  ['dunkin', 'Coffee'],
  // Groceries
  ['whole foods', 'Groceries'],
  ['safeway', 'Groceries'],
  ['trader joe', 'Groceries'],
  ['costco', 'Groceries'],
  ['kroger', 'Groceries'],
  // Gas
  ['shell', 'Gas'],
  ['chevron', 'Gas'],
  ['texaco', 'Gas'],
  // Shopping
  ['amazon', 'Shopping'],
  ['target', 'Shopping'],
  ['best buy', 'Electronics'],
  ['home depot', 'Home Improvement'],
  ['lowe', 'Home Improvement'],
  ['macy', 'Shopping'],
  // Food & Dining
  ['chipotle', 'Dining'],
  ['mcdonalds', 'Dining'],
  ['dominos', 'Dining'],
  ['taco bell', 'Dining'],
  ['panda express', 'Dining'],
  ['jimmy john', 'Dining'],
  ['in-n-out', 'Dining'],
  // Delivery
  ['uber eats', 'Food Delivery'],
  ['doordash', 'Food Delivery'],
  ['blue apron', 'Food Delivery'],
  // Transport
  ['uber', 'Transport'],
  ['lyft', 'Transport'],
  // Subscriptions
  ['netflix', 'Subscriptions'],
  ['spotify', 'Subscriptions'],
  ['adobe', 'Subscriptions'],
  ['amazon prime', 'Subscriptions'],
  ['github', 'Subscriptions'],
  ['zoom', 'Subscriptions'],
  // Utilities
  ['verizon', 'Utilities'],
  ['electric bill', 'Utilities'],
  // Pharmacy
  ['cvs', 'Pharmacy'],
  ['walgreens', 'Pharmacy'],
  // Income
  ['salary', 'Income'],
  ['paypal', 'Transfer'],
  ['venmo', 'Transfer'],
  ['refund', 'Refund'],
  ['tax refund', 'Income'],
  // Housing
  ['rent', 'Housing'],
  // Entertainment
  ['steam', 'Entertainment'],
  ['flowers', 'Gifts'],
]);

const SORTED_PATTERNS = Array.from(CATEGORY_RULES.entries()).sort(
  (a, b) => b[0].length - a[0].length,
);

@Injectable()
export class CategoriesService {

  getAllCategories(): string[] {
    const categories = new Set(CATEGORY_RULES.values());
    return Array.from(categories).sort();
  }

  suggestCategory(description: string): string | null {
    const normalizedDesc = description.toLowerCase();

    for (const [pattern, category] of SORTED_PATTERNS) {
      if (normalizedDesc.includes(pattern)) {
        return category;
      }
    }

    return null;
  }

  suggestCategories(
    descriptions: { id: string; description: string }[],
  ): { id: string; suggestedCategory: string | null }[] {
    return descriptions.map(({ id, description }) => ({
      id,
      suggestedCategory: this.suggestCategory(description),
    }));
  }
}
