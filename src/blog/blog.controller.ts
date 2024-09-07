import { Controller, Delete, Get, Patch, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('blog')
export class BlogController {
    constructor(
        private readonly blogService: BlogService
    ) {}

    @Get('')
    async getBlogs(
        @Res() res: Response
    ) {
        const blogs = await this.blogService.getBlogs();
        res.status(200).json({
            message: "Blogs fetched successfully",
            statusCode: 200,
            blogs
        })
    }

    @Get('byId/:id')
    async getBlogById(
        @Req() req: Request,
        @Res() res: Response 
    ) {
        const blog = await this.blogService.getBlogById(req);
        res.status(200).json({
            message: "Blog fetched successfully",
            statusCode: 200,
            blog
        })
    }

    @Post('')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('Img'))
    async createBlog(
        @Req() req: Request,
        @Res() res: Response,
        @UploadedFile() file: Express.Multer.File
    ) {
        await this.blogService.createBlog(file, req);
        res.status(201).json({
            message: "Blog created successfully",
            statusCode: 201,
        })
    }

    @Put('/:id')
    @UseGuards(AuthGuard)
    async updateBlog(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const blog = await this.blogService.updateBlog(req);
        res.status(200).json({
            message: "Blog updated successfully",
            statusCode: 200,
            blog
        })
    }

    @Delete('/:id')
    @UseGuards(AuthGuard)
    async deleteBlog(
        @Req() req: Request,
        @Res() res: Response
    ) {
        await this.blogService.deleteBlog(req);
        res.status(200).json({
            message: "Blog deleted successfully",
            statusCode: 200,
        })
    }

    @Patch('like/:id')
    @UseGuards(AuthGuard)
    async likeBlog(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const blog = await this.blogService.likeBlog(req);
        res.status(200).json({
            message: "Blog liked successfully",
            statusCode: 200,
            blog
        })
    }

    @Patch('dislike/:id')
    @UseGuards(AuthGuard)
    async dislikeBlog(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const blog = await this.blogService.dislikeBlog(req);
        res.status(200).json({
            message: "Blog disliked successfully",
            statusCode: 200,
            blog
        })
    }
}
