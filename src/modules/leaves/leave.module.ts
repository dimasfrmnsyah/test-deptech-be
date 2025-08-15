import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesService } from './services/leave-admin.service';
import { LeavesController } from './controllers/leave-admin.controller';
import { Leave } from './entities/leave.entity';
import { User } from '../users/entities/user.entity';
import { SelfLeavesController } from './controllers/self-leaves.controller';
import { SelfLeavesService } from './services/self-leave.service';
@Module({
  imports: [TypeOrmModule.forFeature([Leave, User])],
  providers: [LeavesService,SelfLeavesService],
  controllers: [LeavesController,SelfLeavesController],
  exports: [TypeOrmModule],
})
export class LeaveModule {}
