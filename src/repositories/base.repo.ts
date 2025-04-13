import {
  Model,
  UpdateQuery,
  FilterQuery,
  QueryOptions,
  Types,
  ClientSession,
} from 'mongoose';
import { anyObject } from '../utils/response.util';

class BaseRepo<T> {
  protected constructor(private model: Model<T>) {}

  async insert(data: any, session?: ClientSession) {
    return (await this.model.create([data], { session: session || null })).map(
      (doc) => doc.toObject(),
    )[0];
  }

  async insertOne(data: any, session?: ClientSession) {
    return await this.model
      .create([data], { session: session || null })
      .then((docs) => docs[0]);
  }

  async insertMany(data: T[], session?: ClientSession) {
    return await this.model.insertMany(data, { session: session || null });
  }

  async findByIdAndUpdate(
    id: string,
    updateQuery: UpdateQuery<Partial<T>>,
    options?: QueryOptions,
    populate: anyObject = {},
    session?: ClientSession,
  ) {
    return await this.model
      .findByIdAndUpdate(id.toString(), updateQuery, {
        ...options,
        new: true,
        session: session || null,
        ...populate,
      })
      .lean()
      .exec();
  }

  async findById(
    id: string | Types.ObjectId,
    options: QueryOptions | anyObject = {},
    session?: ClientSession,
  ) {
    return await this.model
      .findById(id, {}, { ...options, session: session || null })
      .lean()
      .exec();
  }

  async findOne(
    query: FilterQuery<T>,
    options: QueryOptions | anyObject = {},
    session?: ClientSession,
  ) {
    return await this.model
      .findOne(query, null, { ...options, session: session || null })
      .lean()
      .exec();
  }

  async find(
    query: FilterQuery<T>,
    options: QueryOptions,
    session?: ClientSession,
  ) {
    return await this.model
      .find(query, null, {
        sort: { createdAt: 'desc' },
        ...options,
        session: session || null,
      })
      .lean()
      .exec();
  }

  async search(query: any, options: QueryOptions, session?: ClientSession) {
    return await this.model
      .find(query, null, {
        sort: { createdAt: 'desc' },
        ...options,
        session: session || null,
      })
      .lean()
      .exec();
  }

  async findMostRecent(session?: ClientSession) {
    return await this.model
      .find()
      .sort({ _id: -1 })
      .limit(1)
      .session(session || null)
      .exec();
  }

  async countWithConditionalQuery(query: any, session?: ClientSession) {
    return await this.model
      .countDocuments(query)
      .session(session || null)
      .exec();
  }

  async count(query: any, session?: ClientSession) {
    return await this.model
      .countDocuments(query)
      .session(session || null)
      .exec();
  }

  async updateOne(
    findQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    session?: ClientSession,
  ) {
    return this.model
      .updateOne(findQuery, updateQuery, { session: session || undefined })
      .exec();
  }

  async updateMany(
    findQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    session?: ClientSession,
  ) {
    return this.model
      .updateMany(findQuery, updateQuery, { session: session || undefined })
      .exec();
  }

  async findOneAndUpdate({
    findQuery,
    updateQuery,
    options,
    populate = {},
    session = undefined,
  }: {
    findQuery: FilterQuery<T>;
    updateQuery: UpdateQuery<T>;
    options?: QueryOptions;
    populate?: anyObject;
    session?: ClientSession;
  }) {
    return this.model
      .findOneAndUpdate(findQuery, updateQuery, {
        ...options,
        new: true,
        session: session || null,
        ...populate,
      })
      .lean()
      .exec();
  }

  async deleteOne(query: FilterQuery<T>, session?: ClientSession) {
    return await this.model
      .deleteOne(query, { session: session || undefined })
      .exec();
  }

  async deleteMany(query: FilterQuery<T>, session?: ClientSession) {
    return await this.model
      .deleteMany(query, { session: session || undefined })
      .exec();
  }

  async distinct(key: string, query: FilterQuery<T>, session?: ClientSession) {
    return await this.model
      .distinct(key, query)
      .session(session || null)
      .exec();
  }

  async findOneAndDelete(query: FilterQuery<T>, session?: ClientSession) {
    return await this.model
      .findOneAndDelete(query)
      .session(session || null)
      .exec();
  }

  async aggregate(pipeline: any[], session?: ClientSession) {
    return this.model
      .aggregate(pipeline)
      .session(session || null)
      .exec();
  }
}

export default BaseRepo;
