import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { poolQuery } from '../../dbPool';

import { User } from '../models';

@Injectable()
export class UsersService {
  async findOne(userId: string): Promise<User> {
    const users = await poolQuery(`SELECT * FROM users WHERE id=$1 LIMIT 1`, [userId]);
    return users.rows[0];
  }

  async createOne({ name, email, password }: User): Promise<User> {
    const id = uuidv4();
    const users = await poolQuery(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
      [id, name, email, password],
    );
    return users.rows[0];
  }
}