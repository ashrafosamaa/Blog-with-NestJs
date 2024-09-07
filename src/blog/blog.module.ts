import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from 'src/DB/entities/blog.entity';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/DB/entities/user.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity, UserEntity]),
],
  controllers: [BlogController],
  providers: [BlogService, JwtService]
})
export class BlogModule {}
