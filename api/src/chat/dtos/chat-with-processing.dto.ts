import { ChatEntity } from '../../core/entities/chat.entity';

export interface ChatWithProcessing extends ChatEntity {
  isProcessing: boolean;
}
