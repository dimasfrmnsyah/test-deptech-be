import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateLeaveSelfDto {
  @IsString() @IsNotEmpty() reason!: string;
  @IsDateString() startDate!: string;
  @IsDateString() endDate!: string;
}
