import { Module } from '@nestjs/common';
import { EmployeeJobPostService } from './employee-job.service';
import { EmployeeJobPostController } from './employee-job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from '../employee/employee.entity';
import { HapAIService } from '@hap/integration-ai';
import { EmployeeService } from '../employee/employee.service';

@Module({
	imports: [TypeOrmModule.forFeature([Employee])],
	controllers: [EmployeeJobPostController],
	providers: [EmployeeJobPostService, EmployeeService, HapAIService],
	exports: [EmployeeJobPostService]
})
export class EmployeeJobPostModule {}
