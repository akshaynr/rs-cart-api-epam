import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { Cart, CartItem } from '../models';
import { poolQuery } from '../../dbPool';

@Injectable()
export class CartService {
  async findByUserId(userId: string): Promise<Cart> {
    const text = `
      SELECT * FROM cart WHERE user_id=$1
    `;
    const values = [userId];
    const cartByUserID = await poolQuery(text, values);
    if (cartByUserID.rows.length == 0 || !cartByUserID.rows?.[0]?.id) {
      return null;
    }
    const cartItems = await poolQuery(
      `SELECT * FROM cart_item 
      JOIN products ON products.id = cart_item.product_id WHERE cart_id=$1`,
      [cartByUserID.rows?.[0].id],
    );
    const cart = {
      id: cartByUserID.rows[0].id,
      items: cartItems.rows.map((cartItem) => ({
        product: { ...cartItem },
        count: cartItem.count,
      })),
    };
    return cart;
  }

  async createByUserId(userId: string) {
    const text = `
      INSERT INTO cart (user_id) VALUES ($1) RETURNING *
    `;
    const values = [userId];
    const newCart = await poolQuery(text, values);
    return {
      id: newCart.rows[0].id,
      items: [],
    };
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);
    if (userCart) {
      return userCart;
    }
    const newCart = await this.createByUserId(userId);
    return newCart;
  }

  async updateByUserId(
    userId: string,
    { product, count }: CartItem
  ): Promise<Cart> {
    const { id, ...rest }: any = await this.findOrCreateByUserId(userId);
    const cartItems = await poolQuery(
      `SELECT * FROM cart_item WHERE product_id=$1 AND cart_id=$2`,
      [product.id, id],
    );
    if (count > cartItems.rows?.[0]?.count || !cartItems.rows?.[0]) {
      if (cartItems.rows[0]) {
        await poolQuery(
          `UPDATE cart_item SET count=$3 WHERE product_id=$1 AND cart_id=$2`,
          [product.id, id, count],
        );
      }
    }
    const updatedCartItems = await poolQuery(
      `SELECT * FROM cart_item
      JOIN products ON products.id = cart_item.product_id WHERE cart_id=$1`,
      [id],
    );
    const updatedCart = {
      id,
      ...rest,
      items: updatedCartItems.rows.map((cartItem) => ({
        product: { ...cartItem },
        count: cartItem.count,
      })),
    };
    return updatedCart;
  }

  async removeByUserId(userId): Promise<void> {
    await poolQuery(`DELETE FROM cart WHERE user_id=$1 LIMIT 1`, [userId]);
  }
}