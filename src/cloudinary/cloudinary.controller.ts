import { Controller, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';


@Controller('user')
export class CloudinaryController {

    constructor(
        private cloudinaryService: CloudinaryService
    ) {}

    @Post('add-pic')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('Img'))
    async uploadProfileImage(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File
    ) {
        const user = await this.cloudinaryService.uploadProfileImage(file, req);
        res.status(200).json({
            message: "Profile image uploaded successfully",
            statusCode: 200,
            user
        })
    }

    @Put('update-pic')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('Img'))
    async updateProfileImage(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File
    ) {
        const user = await this.cloudinaryService.updateProfileImage(file, req);
        res.status(200).json({
            message: "Profile image updated successfully",
            statusCode: 200,
            user
        })
    }
}
