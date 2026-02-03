import { Module } from '@nestjs/common';

import { services } from './services';

@Module({
  providers: [...services],
  exports: [...services],
})
export class TemplateModule {}
