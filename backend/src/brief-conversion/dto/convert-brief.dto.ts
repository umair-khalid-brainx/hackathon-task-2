import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConvertBriefDto {
  /**
   * Raw unstructured client or PM brief (plain text).
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120_000)
  text!: string;
}
