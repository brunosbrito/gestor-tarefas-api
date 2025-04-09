import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('value_per_position')
  export class ValuePerPosition {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    position: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    value: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  