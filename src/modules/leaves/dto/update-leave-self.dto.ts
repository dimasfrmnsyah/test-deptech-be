import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveSelfDto } from './create-leave-self.dto';

export class UpdateLeaveSelfDto extends PartialType(CreateLeaveSelfDto) {}
