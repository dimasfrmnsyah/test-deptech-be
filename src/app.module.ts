import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from 'config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { LeaveModule } from './modules/leaves/leave.module';
import { UserModule } from './modules/users/user.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeormConfig }),
    AuthModule,
    LeaveModule,
    UserModule,
    DashboardModule,
  ],
})
export class AppModule {}
