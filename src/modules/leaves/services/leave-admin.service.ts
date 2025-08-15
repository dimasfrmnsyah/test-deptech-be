import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
export class LeavesService {
  constructor(
    @InjectRepository(Leave) private readonly repo: Repository<Leave>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async create(dto: CreateLeaveDto) {
    await this.ensureEmployee(dto.employeeId);
    await this.validateRules(dto.employeeId, dto.startDate, dto.endDate, null);
    const entity = this.repo.create({
      reason: dto.reason,
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: true,
      employee: { id: dto.employeeId } as User,
    });
    return this.repo.save(entity);
  }
  async findAll(query: any) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = (query.search ?? '').trim();

    const qb = this.repo
      .createQueryBuilder('l')
      .leftJoinAndSelect('l.employee', 'employee')
      .orderBy('l.startDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      qb.andWhere(
        `(l.reason LIKE :s OR employee.firstName LIKE :s OR employee.lastName LIKE :s OR employee.email LIKE :s)`,
        { s: `%${search}%` },
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      pagination: { total, page, limit },
    };
  }
  async findOne(id: string) {
    const findOne = await this.repo.findOne({ where: { id } });
    if (!findOne) throw new NotFoundException('Leave not found');
    return findOne;
  }
  async update(id: string, dto: UpdateLeaveDto) {
    const findOne = await this.findOne(id);
    const employeeId = dto.employeeId ?? findOne.employee.id;
    await this.ensureEmployee(employeeId);
    const startDate = dto.startDate ?? findOne.startDate;
    const endDate = dto.endDate ?? findOne.endDate;
    await this.validateRules(employeeId, startDate, endDate, id);
    Object.assign(findOne, {
      reason: dto.reason ?? findOne.reason,
      startDate,
      endDate,
      status: dto.status ?? false,
      employee: { id: employeeId } as User,
    });
    return this.repo.save(findOne);
  }
  async remove(id: string) {
    const l = await this.findOne(id);
    await this.repo.remove(l);
    return { deleted: true };
  }

  private async ensureEmployee(id: string) {
    const u = await this.users.findOne({ where: { id, role: 'EMPLOYEE' } });
    if (!u) throw new BadRequestException('Employee not found');
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

    const years = new Set<number>([sYM.y, eYM.y]);
    for (const year of years) {
      const ys = new Date(Date.UTC(year, 0, 1));
      const ye = new Date(Date.UTC(year, 11, 31));
      const qb = this.repo
        .createQueryBuilder('l')
        .leftJoin('l.employee', 'e')
        .where('e.id = :employeeId', { employeeId })
        .andWhere('l.startDate <= :ye AND l.endDate >= :ys', {
          ys: ys.toISOString().slice(0, 10),
          ye: ye.toISOString().slice(0, 10),
        });
      if (excludeId) qb.andWhere('l.id != :id', { id: excludeId });
      const existing = await qb.getMany();
      const usedDays = existing.reduce((sum, L) => {
        const s = new Date(L.startDate + 'T00:00:00Z');
        const e = new Date(L.endDate + 'T00:00:00Z');
        const sC = s < ys ? ys : s;
        const eC = e > ye ? ye : e;
        return sum + daysInclusive(sC, eC);
      }, 0);
      const sC = startDate < ys ? ys : startDate;
      const eC = endDate > ye ? ye : endDate;
      const thisYearDays = sC <= eC ? daysInclusive(sC, eC) : 0;
      if (usedDays + thisYearDays > 12)
        throw new BadRequestException('Batas cuti per tahun adalah 12 hari per pegawai');
    }
  }
}
