import {Router} from "express"
import { ChannelController } from '../controllers/channel.controller';

const router = Router();

const channelController = new ChannelController();

router.post("/create-channel",channelController.createChannel.bind(channelController));

export default router;