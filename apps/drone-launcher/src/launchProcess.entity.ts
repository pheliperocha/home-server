import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LaunchProcessLog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  processId: string;

  @Column()
  log: string;

  @Column()
  fetched: boolean;

  @Column()
  createdAt: Date;
}
