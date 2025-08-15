import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LeavesService } from '../services/leave-admin.service';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { UpdateLeaveDto } from '../dto/update-leave.dto';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { RolesGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('leaves')
export class LeavesController {
  constructor(private readonly service: LeavesService) {}
  @Post() async create(@Body() dto: CreateLeaveDto) {
    await this.service.create(dto);
    return {
      success: true,
      message: 'User created successfully',
    };
  }
  @Get() async findAll(@Query() query: any) {
    const data = await this.service.findAll(query);
    console.log(query)
    return {
      success: true,
      message: 'Leave Data retrieved successfully',
      data: data.data,
      pagination: data.pagination,
    };
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    console.log(data);
    return {
      sucess: true,
      message: 'Leave found',
      data,
    };
  }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateLeaveDto) {
    await this.service.update(id, dto);
    return {
      success: true,
      message: 'Leave updated successfully',
    };
  }
  @Delete(':id') async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: 'Leave Remove successfully',
    };
  }
}
