import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from 'src/DB/entities/blog.entity';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Stream } from 'stream';


@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(BlogEntity) private blogRepo: Repository<BlogEntity>,
    ) {}

    async getBlogs() {
        const blogs = await this.blogRepo.find({select: ['title', 'likes', 'url']});
        if(!blogs.length) throw new ConflictException('No blogs found');
        return blogs;
    }

    async getBlogById(req: any) {
        const blog = await this.blogRepo.findOne({
            where: { id: req.params.id },
            select: ['title', 'desc', 'body', 'likes', 'url', 'author', 'createdAt' ],
        });
        if(!blog) throw new ConflictException('Blog not found');
        return blog;
    }

    async createBlog(file: Express.Multer.File, req: any) {
        const { title, desc, body } = req.body;
        const author = req.authUser;
        const ID = req.authUser.id
        if (!title || !body) {
            throw new BadRequestException('Title and Body are required');
        }
    let blog: object
        if(file) {
            const folderId = Math.floor(1000 + Math.random() * 9000).toString();
            const uploadStream = (buffer: Buffer): Promise<any> => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: `${process.env.MAIN_FOLDER}/Blogs/${author.id}/${folderId}` },
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
            blog = this.blogRepo.create({ title, desc, body, author, url: secure_url, public_id, folderId, authorId: ID });
            await this.blogRepo.save(blog);
            return true
        }
        blog = this.blogRepo.create({ title, desc, body, author, authorId: ID });
        await this.blogRepo.save(blog);
        return true
    }

    async updateBlog(req: any) {
        const { title, desc, body } = req.body;
        const blog = await this.blogRepo.findOne({
            where: { id: req.params.id },
            select: ['title', 'desc', 'body', 'likes', 'url', 'authorId', 'createdAt' ],
        });
        if(!blog) throw new ConflictException('Blog not found');
        // check authorization
        if(blog.authorId != req.authUser.id) throw new ConflictException('Unauthorized');
        if(title) blog.title = title;
        if(body) blog.body = body;
        if(desc) blog.desc = desc;
        await this.blogRepo.update({ id: req.params.id }, blog);
        return blog
    }

    async deleteBlog(req: any) {
        const blog = await this.blogRepo.findOneBy({ id: req.params.id });
        if(!blog) throw new ConflictException('Blog not found');
        // check authorization
        if(blog.authorId != req.authUser.id) throw new ConflictException('Unauthorized');
        await this.blogRepo.delete({ id: req.params.id });
        // delete image from cloudinary
        await cloudinary.api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Blogs/${blog.authorId}/${blog.folderId}`)
        await cloudinary.api.delete_folder(`${process.env.MAIN_FOLDER}/Blogs/${blog.authorId}/${blog.folderId}`)
        return true
    }

    async likeBlog(req: any) {
        const blog = await this.blogRepo.findOne({
            where: { id: req.params.id },
            select: ['title', 'desc', 'body', 'likes', 'url', 'author', 'createdAt' ],
        });
        if(!blog) throw new ConflictException('Blog not found');
        blog.likes += 1;
        await this.blogRepo.update({ id: req.params.id }, blog);
        return blog
    }

    async dislikeBlog(req: any) {
        const blog = await this.blogRepo.findOne({
            where: { id: req.params.id },
            select: ['title', 'desc', 'body', 'likes', 'url', 'author', 'createdAt' ],
        });
        if(!blog) throw new ConflictException('Blog not found');
        blog.likes -= 1;
        await this.blogRepo.update({ id: req.params.id }, blog);
        return blog
    }

}
