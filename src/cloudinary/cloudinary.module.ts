import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/DB/entities/user.entity';
import { CloudinaryController } from './cloudinary.controller';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [CloudinaryController],
  providers: [CloudinaryProvider, CloudinaryService, JwtService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}
