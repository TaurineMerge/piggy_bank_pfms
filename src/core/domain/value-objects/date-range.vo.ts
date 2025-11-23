import { DomainError } from './money.vo';

export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    if (startDate > endDate) {
      throw new DomainError('Start date cannot be greater than end date');
    }
  }

  static fromMonth(date: Date): DateRange {
    const year = date.getFullYear();
    const month = date.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const dateRange = new DateRange(start, end);

    return dateRange;
  }

  static fromYear(date: Date): DateRange {
    const year = date.getFullYear();

    const start = new Date(year, 0, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const dateRange = new DateRange(start, end);

    return dateRange;
  }

  static last30Days(): DateRange {
    const end = new Date();
    const start = new Date();

    start.setDate(end.getDate() - 30);

    const dateRange = new DateRange(start, end);

    return dateRange;
  }

  doesContain(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  getDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
