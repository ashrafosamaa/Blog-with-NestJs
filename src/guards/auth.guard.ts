import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/DB/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService : JwtService,
        @InjectRepository(UserEntity) private userModel : Repository<UserEntity>,
    ) { }
    async canActivate(
        context : ExecutionContext,
    ) : Promise<object> {
        const req = context.switchToHttp().getRequest();
        const { accesstoken } = req.headers
        if (!accesstoken) {
            throw new BadRequestException('Pleaee lognIn first')
        }
        const decodedData = this.jwtService.verify(accesstoken, { secret: process.env.JWT_SECRET })
        if (!decodedData.id) {
            throw new BadRequestException('Invalid token payload')
        }
        const user = await this.userModel.findOneBy({ id: decodedData.id })
        if (!user) {
            throw new BadRequestException('Unauthorized, Please signup first')
        }
        req.authUser = user
        return req
    }
}
