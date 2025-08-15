import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ length: 255 }) reason!: string;
  @Column({ type: 'date' }) startDate!: string;
  @Column({ type: 'date' }) endDate!: string;
  @Column({ default: false, nullable: false })
  status!: boolean;
  @ManyToOne(() => User, { eager: true, nullable: false, onDelete: 'CASCADE' }) employee!: User;
  @CreateDateColumn({ type: 'timestamp' }) createdAt!: Date;
  @UpdateDateColumn({ type: 'timestamp' }) updatedAt!: Date;
}
