import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Leave } from '../leaves/entities/leave.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Leave) private readonly leaves: Repository<Leave>,
  ) {}

  async getSummary() {
    const [admins, employees, leaves] = await Promise.all([
      this.users.count({ where: { role: 'ADMIN' } }),
      this.users.count({ where: { role: 'EMPLOYEE' } }),
      this.leaves.count(),
    ]);

    return {
      admins,
      employees,
      leaves,
      totalUsers: admins + employees,
    };
  }
}
