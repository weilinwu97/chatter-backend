import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import express from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard) // Authentication happens in the guard/strategy layer (before controller)
  login(
    @CurrentUser() user: User,
    // if set to false, NestJS won't serialize your return value; you must call response.json() yourself. This lets you set cookies while still returning a JSON body.
    @Res({ passthrough: true }) response: express.Response,
  ) {
    return this.authService.login(user, response);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: express.Response) {
    this.authService.logout(response);
  }
}
