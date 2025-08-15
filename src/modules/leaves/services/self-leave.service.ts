import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leave } from '../entities/leave.entity';
import { CreateLeaveDto } from '../dto/create-leave.dto';
import { UpdateLeaveDto } from '../dto/update-leave.dto';
import { User } from '../../users/entities/user.entity';

function daysInclusive(a: Date, b: Date) {
  const ms =
    new Date(b.toISOString().slice(0, 10)).getTime() -
    new Date(a.toISOString().slice(0, 10)).getTime();
  return Math.floor(ms / 86400000) + 1;
}
function ym(d: Date) {
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
}

@Injectable()
export class SelfLeavesService {
  constructor(
    @InjectRepository(Leave) private readonly repo: Repository<Leave>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async listByEmployee(employeeId: string, query: any) {
    console.log(query)
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search || '';
    const startDate = query.startDate;
    const endDate = query.endDate;
  
    const qb = this.repo.createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .where('employee.id = :employeeId', { employeeId });
  
    if (search) {
      qb.andWhere('leave.reason LIKE :search', { search: `%${search}%` });
    }
  
    if (startDate && endDate) {
      qb.andWhere('leave.startDate BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
    }
  
    qb.orderBy('leave.startDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
  
    const [data, total] = await qb.getManyAndCount();
  
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }
  
  async getOwned(employeeId: string, id: string) {
    const l = await this.repo.findOne({ where: { id }, relations: ['employee'] });
    if (!l) throw new NotFoundException('Leave not found');
    if (l.employee.id !== employeeId) throw new ForbiddenException('Forbidden');
    return l;
  }
  async createSelf(
    employeeId: string,
    dto: { reason: string; startDate: string; endDate: string },
  ) {
    await this.validateRules(employeeId, dto.startDate, dto.endDate, null);
    const entity = this.repo.create({ ...dto, employee: { id: employeeId } as any });
    return this.repo.save(entity);
  }
  async updateSelf(
    employeeId: string,
    id: string,
    dto: { reason?: string; startDate?: string; endDate?: string },
  ) {
    const l = await this.getOwned(employeeId, id);
    const startDate = dto.startDate ?? l.startDate;
    const endDate = dto.endDate ?? l.endDate;
    await this.validateRules(employeeId, startDate, endDate, id);
    Object.assign(l, { reason: dto.reason ?? l.reason, startDate, endDate });
    return this.repo.save(l);
  }
  async removeSelf(employeeId: string, id: string) {
    const l = await this.getOwned(employeeId, id);
    await this.repo.remove(l);
    return { deleted: true };
  }
  private async validateRules(
    employeeId: string,
    start: string,
    end: string,
    excludeId: string | null,
  ) {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T00:00:00Z');
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
      throw new BadRequestException('Invalid dates');
    if (endDate < startDate) throw new BadRequestException('endDate must be >= startDate');

    const months = new Set<string>();
    const sYM = ym(startDate);
    const eYM = ym(endDate);
    months.add(`${sYM.y}-${sYM.m}`);
    months.add(`${eYM.y}-${eYM.m}`);
    for (const key of months) {
      const [y, m] = key.split('-').map(Number);
      const monthStart = new Date(Date.UTC(y, m - 1, 1));
      const monthEnd = new Date(Date.UTC(y, m, 0));
      const qb = this.repo
        .createQueryBuilder('l')
        .leftJoin('l.employee', 'e')
        .where('e.id = :employeeId', { employeeId })
        .andWhere('l.startDate <= :me AND l.endDate >= :ms', {
          ms: monthStart.toISOString().slice(0, 10),
          me: monthEnd.toISOString().slice(0, 10),
        });
      if (excludeId) qb.andWhere('l.id != :id', { id: excludeId });
      const existing = await qb.getMany();
      const usedDays = existing.reduce((sum, L) => {
        const s = new Date(L.startDate + 'T00:00:00Z');
        const e = new Date(L.endDate + 'T00:00:00Z');
        const sC = s < monthStart ? monthStart : s;
        const eC = e > monthEnd ? monthEnd : e;
        return sum + daysInclusive(sC, eC);
      }, 0);
      const sC = startDate < monthStart ? monthStart : startDate;
      const eC = endDate > monthEnd ? monthEnd : endDate;
      const thisMonthDays = sC <= eC ? daysInclusive(sC, eC) : 0;
      if (usedDays + thisMonthDays > 1)
        throw new BadRequestException('Batas cuti per bulan adalah 1 hari per pegawai');
    }
  }
}
