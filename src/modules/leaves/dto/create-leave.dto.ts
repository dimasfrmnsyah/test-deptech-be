import { IsDateString, IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional } from 'class-validator';
export class CreateLeaveDto {
  @IsUUID() employeeId!: string;
  @IsString() @IsNotEmpty() reason!: string;
  @IsBoolean() @IsOptional() status?: boolean;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
