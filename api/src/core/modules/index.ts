import { configModule } from './config.module';
import { typeormForFeature, typeormForRoot } from './typeorm.module';

export const modules = [configModule, typeormForRoot, typeormForFeature];
