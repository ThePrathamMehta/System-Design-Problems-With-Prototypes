import { getClient } from '@repo/db';
import type { Request, Response } from 'express';
import { producer } from '../lib/kafka';

export class MessageController {

  async sendMessage(req: Request, res: Response) {
    console.log('📥 sendMessage hit — body:', req.body);
    try {
      const { from_user, channel_id, content } = req.body;
      const client = await getClient();

      console.log('💾 Inserting into DB...');
      const result = await client.query(
        `INSERT INTO messages (from_user,channel_id,content)values ($1,$2,$3) RETURNING *`,
        [from_user, channel_id, content]
      );
      const newMessage = result.rows[0];
      console.log('✅ DB insert done:', newMessage);

      console.log('📤 Sending to Kafka...');
      await producer.send({
        topic: 'messages',
        messages: [
          {
            key: String(channel_id),
            value: JSON.stringify({
              message_id: newMessage.id,
              channel_id: channel_id,
              sender_id: from_user,
              content
            }),
          },
        ],
      });
      console.log('✅ Kafka produce done');

      res.status(201).json({
        data: newMessage,
        message: 'Message sent successfully',
      });
    } catch (e) {
      console.error('❌ sendMessage error:', e);
      res.status(500).json({ error: String(e) });
    }
  }
}
