import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/DB/entities/user.entity";
import { Repository } from "typeorm";
import { v2 as cloudinary } from 'cloudinary';
import * as bcrypt from 'bcrypt';


@Injectable()
    export class UserService {

        constructor(
            @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        ) {}

    async getAccount(req: any) {
        const user = await this.userRepo.findOne({ 
            where: { id: req.authUser.id },
            select: ['name', 'email', 'username', "url"] })
        if(!user) throw new ConflictException('User not found')
        return user
    }

    async updateAccount (req: any) {
        const user = await this.userRepo.findOne({ 
            where: { id: req.authUser.id }, 
            select: ['name', 'email', 'username', "url"] })
        if(!user) throw new ConflictException('User not found')
        if(req.body.name) user.name = req.body.name
        if(req.body.username) user.username = req.body.username
        await this.userRepo.update({ id: req.authUser.id }, user)
        return user
    }

    async updatePassword (req: any) {
        const user = await this.userRepo.findOneBy({ id: req.authUser.id })
        if(!user) throw new ConflictException('User not found')
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, parseInt(process.env.SALT_ROUND_1))
        user.password = hashedPassword
        await this.userRepo.update({ id: req.authUser.id }, user)
        return true
    }

    async deleteAccount (req: any) {
        const user = await this.userRepo.findOneBy({ id: req.authUser.id })
        if(!user) throw new ConflictException('User not found')
        await this.userRepo.delete({ id: req.authUser.id })
        // delete image from cloudinary
        await cloudinary.api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Users/${user.folderId}`)
        await cloudinary.api.delete_folder(`${process.env.MAIN_FOLDER}/Users/${user.folderId}`);
        return true
    }

}
