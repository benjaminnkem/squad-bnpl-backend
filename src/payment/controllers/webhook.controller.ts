import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

@Controller('payment/webhook')
@ApiTags('Webhook')
@ApiBearerAuth()
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('squad')
  async squadWebhook(@Req() req: Request, @Res() res: Response) {
    const data = await this.webhookService.processSquadWebhook(req);

    res.status(200).json(data);
  }
}
