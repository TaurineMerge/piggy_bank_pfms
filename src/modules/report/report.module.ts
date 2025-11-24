import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ReportService } from './report.service';
import { GetMonthlyReportHandler } from '../../core/application/queries/get-monthly-report/get-monthly-report.handler';

@Module({
  imports: [DatabaseModule],
  providers: [ReportService, GetMonthlyReportHandler],
  exports: [ReportService],
})
export class ReportModule {}
