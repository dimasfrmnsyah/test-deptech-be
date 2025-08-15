import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards ,Query} from '@nestjs/common';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { RolesGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { SelfLeavesService } from '../services/self-leave.service';
import { CreateLeaveSelfDto } from '../dto/create-leave-self.dto';
import { UpdateLeaveSelfDto } from '../dto/update-leave-self.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('EMPLOYEE')
@Controller('me/leaves')
export class SelfLeavesController {
  constructor(private readonly service: SelfLeavesService) {}
  @Get() async list(@CurrentUser() u: any,@Query() query: any) {
    const data = await this.service.listByEmployee(u.sub,query);
    return {
      success: true,
      message: 'Leave Data retrieved successfully',
      data: data.data,
      pagination: data.pagination,
  }
  }
  @Get(':id') async detail(@CurrentUser() u: any, @Param('id') id: string) {
     const data = await this.service.getOwned(u.sub, id);
    return {
      sucess: true,
      message: 'Leave found',
      data,
    };
  }
  @Post() async create(@CurrentUser() u: any, @Body() dto: CreateLeaveSelfDto) {
    await this.service.createSelf(u.sub, dto);
    return {
      success: true,
      message: 'Leave created successfully',
    };
  }
  @Patch(':id') async update(
    @CurrentUser() u: any,
    @Param('id') id: string,
    @Body() dto: UpdateLeaveSelfDto,
  ) {
    return this.service.updateSelf(u.sub, id, dto);
  }
  @Delete(':id') async remove(@CurrentUser() u: any, @Param('id') id: string) {
    await this.service.removeSelf(u.sub, id);
    return {
      success: true,
      message: 'Leave deleted successfully',
    };
  }
}
