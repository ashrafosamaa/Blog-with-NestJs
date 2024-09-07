import { Controller, Delete, Get, Patch, Put, Req, Res, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Response, Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';


@Controller('user')
export class UserController {

    constructor (
        private readonly userService: UserService
    ) {}

    @Get('')
    @UseGuards(AuthGuard)
    async getAccount (
        @Req() req: Request,
        @Res() res: Response
    ) {
        // get response
        const user = await this.userService.getAccount(req)
        res.status(200).json({
            message: "User account fetched successfully",
            statusCode: 200,
            user
        })
    }

    @Put('')
    @UseGuards(AuthGuard)
    async updateAccount (
        @Req() req: Request,
        @Res() res: Response
    ) {
        // get response
        const user = await this.userService.updateAccount(req)
        res.status(200).json({
            message: "User account updated successfully",
            statusCode: 200,
            user
        })
    }

    @Patch('')
    @UseGuards(AuthGuard)
    async updatePassword (
        @Req() req: Request,
        @Res() res: Response
    ) {
        // get response
        await this.userService.updatePassword(req)
        res.status(200).json({
            message: "User password updated successfully",
            statusCode: 200,
        })
    }

    @Delete('')
    @UseGuards(AuthGuard)
    async deleteAccount (
        @Req() req: Request,
        @Res() res: Response
    ) {
        // get response
        await this.userService.deleteAccount(req)
        res.status(200).json({
            message: "User account deleted successfully",
            statusCode: 200,
        })
    }

}
