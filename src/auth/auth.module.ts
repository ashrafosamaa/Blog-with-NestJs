import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/DB/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SendEmailService } from 'src/common/services/send-email.service';
import { JwtService } from '@nestjs/jwt';


@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity])
    ],
    controllers: [AuthController],
    providers: [AuthService, SendEmailService, JwtService]
})
export class AuthModule {}
