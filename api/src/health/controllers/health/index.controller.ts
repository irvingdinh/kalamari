import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('/api/health')
export class IndexController {
  @Get()
  index(@Res() res: Response) {
    res.status(HttpStatus.OK).json({});
  }
}
