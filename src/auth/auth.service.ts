import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/DB/entities/user.entity';
import { SendEmailService } from "../common/services/send-email.service";


@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private sendEmailService: SendEmailService,
        private jwtService: JwtService
    ) {}

    async signUpService(req: any){
        const { name, username, email, password } = req.body;
        // email check
        const isEmailExist = await this.userRepo.findOne({ where: { email } })
        if (isEmailExist) {
            throw new BadRequestException('Email already exists, try another one');
        }
        // username check
        const isUsernameExist = await this.userRepo.findOne({ where: { username } })
        if (isUsernameExist) {
            throw new BadRequestException('Username already exists, try another one');
        }
        // hash password 
        const hashedPassword = bcrypt.hashSync(password , parseInt(process.env.SALT_ROUND_1));
        // activation code
        const activateCode = Math.floor(1000 + Math.random() * 9000).toString();
        const accountActivateCode = bcrypt.hashSync(activateCode, parseInt(process.env.SALT_ROUND_2));
        // send confirmation email
        try{
            await this.sendEmailService.sendEmail(
                email,
                "Verification Code (valid for 10 minutes)",
                `Hi ${name},\nYour verification code is ${activateCode}.
                \nEnter this code to access our [website or app] to activate your [customer portal] account.
                \nWe’re glad you’re here!`,
            )
        }
        catch{
            throw new InternalServerErrorException(`Email not sent, please try again`);
        }
        // create user
        const user = this.userRepo.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: 'USER',
            accountActivateCode
        })
        await this.userRepo.save(user)
        return true
    }

    async verifyAccount(req: any) {
        const { email, activateCode } = req.body
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        // check activation code
        const checkCode = bcrypt.compareSync(activateCode, user.accountActivateCode);
        if (!checkCode) {
            throw new BadRequestException('Invalid activation code');
        }
        user.accountActivateCode = null;
        user.accountActivated = true;
        await this.userRepo.save(user);
        // return token
        const userToken = this.jwtService.sign({ id: user.id, name: user.name, email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: "90d" })
        return userToken
    }

    async login(req: any) {
        const { email, password } = req.body
        const user = await this.userRepo.findOneBy({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        // check password
        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestException('Invalid password');
        }
        // return token
        const userToken = this.jwtService.sign({ id: user.id, name: user.name, email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: "90d" })
        return userToken
    }

    async resendVerificationCode(req: any) {
        const { email } = req.body
        const user = await this.userRepo.findOneBy({ email });
        if (!user) throw new BadRequestException('User not found');
        // check if account already activated
        if(user.accountActivated) throw new BadRequestException('Account already activated');
        // activation code
        const activateCode = Math.floor(1000 + Math.random() * 9000).toString();
        const accountActivateCode = bcrypt.hashSync(activateCode, parseInt(process.env.SALT_ROUND_2));
        // send confirmation email
        try{
            await this.sendEmailService.sendEmail(
                email,
                "Verification Code (valid for 10 minutes)",
                `Hi ${user.name},\nYour verification code is ${activateCode}.
                \nEnter this code to access our [website or app] to activate your [customer portal] account.
                \nWe’re glad you’re here!`,
            )
        }
        catch{
            throw new InternalServerErrorException(`Email not sent, please try again`);
        }
        user.accountActivateCode = accountActivateCode;
        await this.userRepo.save(user);
        return true
    }

    async forgotPassword(req: any) {
        const { email } = req.body
        const user = await this.userRepo.findOneBy({ email });
        if (!user) throw new BadRequestException('User not found');
        // password reset code
        const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
        const passwordResetCode = bcrypt.hashSync(resetCode, parseInt(process.env.SALT_ROUND_2));
        // send confirmation email
        try{
            await this.sendEmailService.sendEmail(
                email,
                "Password Reset Code (valid for 10 minutes)",
                `Hi ${user.name},\nYour password reset code is ${resetCode}.
                \nEnter this code to access our [website or app] to reset your [customer portal] password.
                \nWe’re glad you’re here!`,
            )
        }
        catch{
            throw new InternalServerErrorException(`Email not sent, please try again`);
        }
        user.passwordResetCode = passwordResetCode;
        await this.userRepo.save(user);
        return true
    }

    async verifyPasswordReset(req: any) {
        const { email, passwordResetCode } = req.body
        const user = await this.userRepo.findOneBy({ email });
        if (!user) throw new BadRequestException('User not found');
        // check password reset code
        const checkPasswordResetCode = bcrypt.compareSync(passwordResetCode, user.passwordResetCode);
        if (!checkPasswordResetCode) throw new BadRequestException('Invalid password reset code');
        user.passwordResetVerified = true;
        await this.userRepo.save(user);
        return true
    }

    async changePassword(req: any) {
        const { email, newPassword } = req.body
        const user = await this.userRepo.findOneBy({ email });
        if (!user) throw new BadRequestException('User not found');
        if(!user.passwordResetVerified) throw new BadRequestException('Please reset your password first to get email verification code');
        // hash password
        const hashedPassword = bcrypt.hashSync(newPassword , parseInt(process.env.SALT_ROUND_1));
        user.password = hashedPassword;
        user.passwordResetCode = null;
        user.passwordResetVerified = false;
        await this.userRepo.save(user);
        const userToken = this.jwtService.sign({ id: user.id, name: user.name, email: user.email },
            { secret: process.env.JWT_SECRET, expiresIn: "90d" })
        return userToken
    }
}
