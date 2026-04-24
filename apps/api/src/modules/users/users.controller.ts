import { Controller, Get, Put, Body, Param, ForbiddenException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (id !== user.id) {
      throw new ForbiddenException('Cannot access another user profile');
    }
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: any, @CurrentUser() user: AuthenticatedUser) {
    if (id !== user.id) {
      throw new ForbiddenException('Cannot update another user profile');
    }
    return this.usersService.updateUser(id, data);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    if (id !== user.id) {
      throw new ForbiddenException('Cannot access another user settings');
    }
    return this.usersService.getUserSettings(id);
  }
}
