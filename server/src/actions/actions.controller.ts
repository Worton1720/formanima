import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';

@Controller('habits/:habitId/actions')
@UseGuards(JwtAuthGuard)
export class ActionsController {
  constructor(private actions: ActionsService) {}

  @Get()
  findAll(@Param('habitId') habitId: string, @Request() req: any) {
    return this.actions.findAll(habitId, req.user.userId);
  }

  @Post()
  create(@Param('habitId') habitId: string, @Body() dto: CreateActionDto, @Request() req: any) {
    return this.actions.create(habitId, req.user.userId, dto);
  }

  @Patch(':actionId')
  update(
    @Param('habitId') habitId: string,
    @Param('actionId') actionId: string,
    @Body() dto: Partial<CreateActionDto>,
    @Request() req: any,
  ) {
    return this.actions.update(habitId, actionId, req.user.userId, dto);
  }

  @Delete(':actionId')
  remove(
    @Param('habitId') habitId: string,
    @Param('actionId') actionId: string,
    @Request() req: any,
  ) {
    return this.actions.remove(habitId, actionId, req.user.userId);
  }
}
