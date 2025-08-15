import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Like } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async create(dto: CreateUserDto) {
    const { password, confirmPassword, ...rest } = dto;
    if (password !== confirmPassword) {
      throw new UnprocessableEntityException('Passwords do NOT match');
    }
    const find = await this.repo.findOne({ where: { email: rest.email.toLowerCase() } });
    if (find) throw new UnprocessableEntityException('Email already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const entity = this.repo.create({ ...rest, role: 'EMPLOYEE', passwordHash });
    return this.repo.save(entity);
  }
  async findAll(query: any) {
    const { page = 1, limit = 10, search = '' } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [data, total] = await this.repo.findAndCount({
      where: [
        {
          role: 'EMPLOYEE',
          firstName: search ? Like(`%${search}%`) : undefined,
        },
        {
          role: 'EMPLOYEE',
          lastName: search ? Like(`%${search}%`) : undefined,
        },
        {
          role: 'EMPLOYEE',
          email: search ? Like(`%${search}%`) : undefined,
        },
      ],
      order: { lastName: 'ASC' },
      skip,
      take,
    });

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('User not found');
    delete (u as any).passwordHash;
    return u;
  }
  async update(id: string, dto: UpdateUserDto) {
    const { password, confirmPassword, ...rest } = dto;

    const u = await this.findOne(id);

    if (dto.password) {
      if (password !== confirmPassword) {
        throw new UnprocessableEntityException('Passwords do NOT match');
      }
      const hash = await bcrypt.hash(dto.password, 10);
      (u as any).passwordHash = hash;
    }

    Object.assign(u, rest);
    return this.repo.save(u);
  }
  async remove(id: string) {
    const u = await this.findOne(id);
    await this.repo.remove(u);
    return { deleted: true };
  }
  async multipleCreate(body: any) {
    const users = body.map((user: any) =>
      this.repo.create({ ...user, passwordHash: bcrypt.hash('123456', 10), role: 'EMPLOYEE' }),
    );
    return this.repo.save(users);
  }
}
