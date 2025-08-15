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
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'common/guards/jwt-auth.guard';
import { RolesGuard } from 'common/guards/role.guard';
import { Roles } from 'common/decorators/role.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Post() async create(@Body() dto: CreateUserDto) {
    await this.service.create(dto);
    return {
      success: true,
      message: 'User created successfully',
    };
  }
  @Get() async findAll(@Query() query: any) {
    const data = await this.service.findAll(query);
    return {
      success: true,
      message: 'Users retrieved successfully',
      data: data.data,
      pagination: data.pagination,
    };
  }
  @Get(':id') async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return {
      sucess: true,
      message: 'User found',
      data,
    };
  }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    await this.service.update(id, dto);
    return {
      success: true,
      message: 'User updated successfully',
    };
  }
  @Delete(':id') async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
  @Post('multiple') async createAsd(@Body() dto: any) {
    await this.service.multipleCreate(dto);
    return {
      success: true,
      message: 'User created successfully',
    };
  }
}
