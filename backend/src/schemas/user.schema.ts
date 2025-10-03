import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true, unique: true })
  githubId: number;

  @Prop({ required: true })
  login: string;

  @Prop()
  email: string;

  @Prop()
  avatar_url: string;

  @Prop()
  eth_address: string;

  @Prop({ type: Date })
  last_claimed: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
