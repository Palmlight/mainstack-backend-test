import { Model, UpdateQuery, FilterQuery, QueryOptions, Types } from 'mongoose';
import { anyObject } from '../utils/response.util';

class BaseRepo<T> {
  protected constructor(private model: Model<T>) {}

  async insert(data: any) {
    return (await this.model.create(data)).toObject();
  }

  async insertOne(data: any) {
    return await this.model.create(data);
  }

  async insertMany(data: T[]) {
    return await this.model.insertMany(data);
  }

  async findByIdAndUpdate(
    id: string,
    updateQuery: UpdateQuery<Partial<T>>,
    options?: QueryOptions,
    populate: anyObject = {},
  ) {
    return await this.model
      .findByIdAndUpdate(id.toString(), updateQuery, {
        ...options,
        new: true,
        ...populate,
      })
      .lean()
      .exec();
  }
  async findById(
    id: string | Types.ObjectId,
    options: QueryOptions | anyObject = {},
  ) {
    return await this.model.findById(id, {}, options).lean().exec();
  }

  async findOne(query: FilterQuery<T>, options: QueryOptions | anyObject = {}) {
    return await this.model.findOne(query, null, options).lean().exec();
  }

  async find(query: FilterQuery<T>, options: QueryOptions) {
    return await this.model
      .find(query, null, { sort: { createdAt: 'desc' }, ...options })
      .lean()
      .exec();
  }

  async search(query: any, options: QueryOptions) {
    return await this.model
      .find(query, null, { sort: { createdAt: 'desc' }, ...options })
      .lean()
      .exec();
  }

  async findMostRecent() {
    return await this.model.find().sort({ _id: -1 }).limit(1);
  }

  async countWithConditionalQuery(query: any) {
    return await this.model.countDocuments(query).lean().exec();
  }

  async count(query: any) {
    return await this.model.countDocuments(query).lean().exec();
  }

  async updateOne(findQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return this.model.updateOne(findQuery, updateQuery).exec();
  }

  async updateMany(findQuery: FilterQuery<T>, updateQuery: UpdateQuery<T>) {
    return this.model.updateMany(findQuery, updateQuery).exec();
  }

  async findOneAndUpdate(
    findQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    options?: QueryOptions,
    populate: anyObject = {},
  ) {
    return this.model
      .findOneAndUpdate(findQuery, updateQuery, {
        ...options,
        new: true,
        ...populate,
      })
      .lean()
      .exec();
  }

  async deleteOne(query: FilterQuery<T>) {
    return await this.model.deleteOne(query).exec();
  }

  async deleteMany(query: FilterQuery<T>) {
    return await this.model.deleteMany(query).exec();
  }

  async distinct(key: string, query: FilterQuery<T>) {
    return await this.model.distinct(key, query).exec();
  }
  async findOneAndDelete(query: FilterQuery<T>) {
    return await this.model.findOneAndDelete(query).exec();
  }

  async aggregate(pipeline: any[]) {
    return this.model.aggregate(pipeline).exec();
  }
}

export default BaseRepo;
