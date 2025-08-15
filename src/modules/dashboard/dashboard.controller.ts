import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { RolesGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  async summary() {
    const data = await this.service.getSummary();
    return {
      success: true,
      message: 'dashboard retreived successfully',
      data,
    };
  }
}
