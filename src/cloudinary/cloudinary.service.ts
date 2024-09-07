import { ConflictException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/DB/entities/user.entity';
import { Repository } from 'typeorm';
import { Stream } from 'stream';

@Injectable()
export class CloudinaryService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    ) {}

    async uploadProfileImage(file: Express.Multer.File, req: any) {
        const user = await this.userRepo.findOne({
            where: { id: req.authUser.id },
            select: ['name', 'email', 'username', 'url'],
        });
        if (!user) throw new ConflictException('User not found');
        if (!file) throw new ConflictException('Image not found');
        const folderId = Math.floor(1000 + Math.random() * 9000).toString();

        const uploadStream = (buffer: Buffer): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: `${process.env.MAIN_FOLDER}/Users/${folderId}` },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                const bufferStream = new Stream.PassThrough();
                bufferStream.end(buffer);
                bufferStream.pipe(stream);
            });
        };
        const { secure_url, public_id } = await uploadStream(file.buffer);
        user.url = secure_url;
        user.public_id = public_id;
        user.folderId = folderId
        await this.userRepo.update({ id: req.authUser.id }, user);
        return user;
    }

    async updateProfileImage(file: Express.Multer.File, req: any) {
        const { oldPublicId } = req.body;
        const user = await this.userRepo.findOne({
            where: { id: req.authUser.id },
            select: ['name', 'email', 'username', 'url', 'public_id', 'folderId'],
        });
        if (!user) throw new ConflictException('User not found');
        if(user.public_id != oldPublicId || !req.file){
            throw new ConflictException('Image not found');
        }
        const newPublicId = oldPublicId.split(`${user.folderId}/`)[1]
        const uploadStream = (buffer: Buffer): Promise<any> => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: `${process.env.MAIN_FOLDER}/Users/${user.folderId}`, 
                    public_id: newPublicId },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                const bufferStream = new Stream.PassThrough();
                bufferStream.end(buffer);
                bufferStream.pipe(stream);
            });
        };
        const { secure_url, public_id } = await uploadStream(file.buffer);
        user.url = secure_url;
        user.public_id = public_id;
        await this.userRepo.update({ id: req.authUser.id }, user);
        return user;
    }

}
