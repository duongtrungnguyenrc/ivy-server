import { HttpException, InternalServerErrorException } from "@nestjs/common";
import { ClientSession, Model, Document } from "mongoose";

export async function withMutateTransaction<T extends Document, K = T>(
  model: Model<T>,
  callback: (session: ClientSession) => Promise<K> | K,
): Promise<K> {
  const session: ClientSession = await model.db.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();

    return result;
  } catch (error) {
    await session.abortTransaction();

    throw error instanceof HttpException ? error : new InternalServerErrorException(error.message);
  } finally {
    await session.endSession();
  }
}
