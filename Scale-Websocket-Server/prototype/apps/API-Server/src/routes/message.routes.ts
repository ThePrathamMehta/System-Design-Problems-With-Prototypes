import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';

const router = Router();

const messageConroller = new MessageController();

router.post("/send-message",messageConroller.sendMessage.bind(messageConroller));

export default router;  