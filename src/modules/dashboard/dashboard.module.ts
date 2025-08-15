import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Leave } from '../leaves/entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Leave])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
