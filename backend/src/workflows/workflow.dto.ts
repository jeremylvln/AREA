import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class WorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class WorkflowObjectDto {
  @IsString()
  @IsNotEmpty()
  kind: string;

  @IsString()
  @IsNotEmpty()
  id: string;
}

export class WorkflowEnableDto {
  @IsBoolean()
  enabled: boolean;
}