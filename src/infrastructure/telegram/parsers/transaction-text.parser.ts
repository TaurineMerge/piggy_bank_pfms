import { Injectable } from '@nestjs/common';

export interface ParsedTransaction {
  amount: number;
  description: string;
}

@Injectable()
export class TransactionParser {
  parse(text: string): ParsedTransaction | null {
    // Patterns:
    // "500 taxi"
    // "1200.50 groceries"
    // "3500р internet"

    const patterns = [
      /^(\d+(?:[.,]\d{1,2})?)\s*(?:р|руб|₽)?\s+(.+)$/i,
      /^(\d+(?:[.,]\d{1,2})?)\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = text.trim().match(pattern);

      if (match) {
        const amountStr = match[1].replace(',', '.');
        const amount = parseFloat(amountStr);
        const description = match[2].trim();
        if (amount > 0 && description.length > 0) {
          return {
            amount,
            description,
          };
        }
      }
    }

    return null;
  }
}
