import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstallmentPlanService } from './installment-plan.service';
import { CreateInstallmentPlanDto } from './dto/create-installment-plan.dto';
import { UpdateInstallmentPlanDto } from './dto/update-installment-plan.dto';

@Controller('installment-plan')
export class InstallmentPlanController {
  constructor(private readonly installmentPlanService: InstallmentPlanService) {}

  @Post()
  create(@Body() createInstallmentPlanDto: CreateInstallmentPlanDto) {
    return this.installmentPlanService.create(createInstallmentPlanDto);
  }

  @Get()
  findAll() {
    return this.installmentPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installmentPlanService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInstallmentPlanDto: UpdateInstallmentPlanDto) {
    return this.installmentPlanService.update(+id, updateInstallmentPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.installmentPlanService.remove(+id);
  }
}
