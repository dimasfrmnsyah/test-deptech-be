import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'ADMIN' | 'EMPLOYEE';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ length: 100 }) firstName!: string;
  @Column({ length: 100 }) lastName!: string;

  @Index({ unique: true })
  @Column({ length: 160 })
  email!: string;

  @Column({ type: 'date', nullable: true }) birthDate?: string;
  @Column({ length: 10, nullable: true }) gender?: 'L' | 'P';

  @Column({ nullable: true }) passwordHash?: string;

  @Column({ length: 20, nullable: true }) phone?: string;

  @Column({ type: 'date', nullable: true }) dateJoin?: Date;

  @Column({ length: 255, nullable: true }) address?: string;

  @Column({ type: 'enum', enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' }) role!: UserRole;

  @CreateDateColumn({ type: 'timestamp' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updatedAt!: Date;

  @BeforeInsert() normalizeEmail() {
    this.email = this.email.toLowerCase();
  }
}
