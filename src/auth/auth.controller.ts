import { Controller, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';


@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService : AuthService
    ) {}

    @Post("signup") 
    async signUp (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response 
        await this.authService.signUpService(req);
        // response 
        res.status(201).json({
            message : "User created successfully, Please check your email to verify your account",
            statusCode: 201
        })
    }

    @Post("verify")
    async verifyAccount (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        const token = await this.authService.verifyAccount(req);
        // response
        res.status(200).json({
            message: "Account verified successfully",
            statusCode: 200,
            token
        })
    }

    @Post("login")
    async login (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        const token = await this.authService.login(req);
        // response
        res.status(200).json({
            message: "Login successfully",
            statusCode: 200,
            token
        })
    }

    @Post("resend")
    async resendVerificationCode (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        await this.authService.resendVerificationCode(req);
        // response
        res.status(200).json({
            message: "Verification code sent successfully",
            statusCode: 200
        })
    }

    @Post("forgetpassword")
    async forgotPassword (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        await this.authService.forgotPassword(req);
        // response
        res.status(200).json({
            message: "Password reset code sent successfully",
            statusCode: 200
        })
    }

    @Post("verifycode")
    async verifyPasswordReset (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        await this.authService.verifyPasswordReset(req);
        // response
        res.status(200).json({
            message: "Code verified successfully",
            statusCode: 200
        })
    }

    @Patch("resetpassword")
    async changePassword (
        @Req() req : Request,
        @Res() res : Response
    ) {
        // get response
        const token =await this.authService.changePassword(req);
        // response
        res.status(200).json({
            message: "Password changed successfully",
            statusCode: 200,
            token
        })
    }
}
