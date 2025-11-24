import { Injectable } from '@nestjs/common';
import { GetMonthlyReportHandler } from '../../core/application/queries/get-monthly-report/get-monthly-report.handler';
import { GetMonthlyReportDto } from '../../core/application/queries/get-monthly-report/get-monthly-report.dto';

@Injectable()
export class ReportService {
  constructor(private getMonthlyReportHandler: GetMonthlyReportHandler) {}

  async getMonthlyReport(dto: GetMonthlyReportDto) {
    return this.getMonthlyReportHandler.execute(dto);
  }
}
