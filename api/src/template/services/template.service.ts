import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateService {
  private readonly handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
  }

  render(template: string, context: Record<string, unknown>): string {
    const compiled = this.handlebars.compile(template);
    return compiled(context);
  }
}
