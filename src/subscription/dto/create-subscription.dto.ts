import { IsUUID, IsString, IsUppercase, Length } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  userId: string;

  email: string;

  @IsString()
  @IsUppercase()
  @Length(2, 10)
  symbol: string;
}