import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { ContributeGoalDto, CreateSavingsGoalDto } from './dto/create-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { MonthQueryDto, RequiredMonthQueryDto } from './dto/month-query.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private finance: FinanceService) {}

  // Transactions — specific routes BEFORE parameterised ones to avoid conflicts
  @Get('recurring')
  getRecurring(@Request() req: any) {
    return this.finance.getRecurringTransactions(req.user.userId);
  }

  @Get('trends')
  getTrends(@Request() req: any, @Query('months') months?: string) {
    return this.finance.getTrends(req.user.userId, months ? parseInt(months, 10) : 6);
  }

  @Get('transactions')
  getTransactions(@Request() req: any, @Query() { month }: MonthQueryDto) {
    return this.finance.getTransactions(req.user.userId, month);
  }

  @Get('summary')
  getSummary(@Request() req: any, @Query() { month }: MonthQueryDto) {
    return this.finance.getSummary(req.user.userId, month);
  }

  @Get('breakdown')
  getCategoryBreakdown(@Request() req: any, @Query() { month }: MonthQueryDto) {
    return this.finance.getCategoryBreakdown(req.user.userId, month);
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateTransactionDto, @Request() req: any) {
    return this.finance.createTransaction(req.user.userId, dto);
  }

  @Delete('transactions/:id')
  deleteTransaction(@Param('id') id: string, @Request() req: any) {
    return this.finance.deleteTransaction(req.user.userId, id);
  }

  // Budgets
  @Get('budgets')
  getBudgets(@Request() req: any, @Query() { month }: RequiredMonthQueryDto) {
    return this.finance.getBudgets(req.user.userId, month);
  }

  @Put('budgets')
  upsertBudget(@Body() dto: UpsertBudgetDto, @Request() req: any) {
    return this.finance.upsertBudget(req.user.userId, dto);
  }

  @Delete('budgets/:id')
  deleteBudget(@Param('id') id: string, @Request() req: any) {
    return this.finance.deleteBudget(req.user.userId, id);
  }

  // Goals
  @Get('goals')
  getGoals(@Request() req: any) {
    return this.finance.getGoals(req.user.userId);
  }

  @Post('goals')
  createGoal(@Body() dto: CreateSavingsGoalDto, @Request() req: any) {
    return this.finance.createGoal(req.user.userId, dto);
  }

  @Put('goals/:id/contribute')
  contribute(@Param('id') id: string, @Body() dto: ContributeGoalDto, @Request() req: any) {
    return this.finance.contribute(req.user.userId, id, dto);
  }

  @Put('goals/:id')
  updateSavingsGoal(@Param('id') id: string, @Body() dto: UpdateSavingsGoalDto, @Request() req: any) {
    return this.finance.updateSavingsGoal(req.user.userId, id, dto);
  }

  @Delete('goals/:id')
  deleteGoal(@Param('id') id: string, @Request() req: any) {
    return this.finance.deleteGoal(req.user.userId, id);
  }
}
