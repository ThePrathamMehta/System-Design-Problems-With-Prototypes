import type { Request, Response } from 'express';
import { getClient } from '@repo/db';

export class ChannelController {
  
  async createChannel(req: Request, res: Response) {
    try {
      const { orgId, name, type } = req.body;
      const client = await getClient();
      const result = await client.query(
        `INSERT INTO channels (org_id,name,type) values ($1,$2,$3) RETURNING *`,
        [orgId, name, type]
      );
      const newChannel = result.rows[0];
      res.status(201).json({
        channel_id: newChannel._id,
        message: 'Channel Created',
      });
    } catch (e) {
      console.log(e);
    }
  }
}
