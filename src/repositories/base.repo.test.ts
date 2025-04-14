import { Model, ClientSession } from 'mongoose';
import BaseRepo from './base.repo';

interface TestData {
  _id?: string;
  name: string;
  value: number;
  createdAt?: Date;
}

class TestRepo extends BaseRepo<TestData> {
  public constructor(model: Model<TestData>) {
    super(model);
  }
}

interface MockExec {
  exec: jest.Mock;
}

interface MockLean extends MockExec {
  lean: jest.Mock<MockExec, []>;
}

interface MockSession extends MockLean {
  session: jest.Mock<MockLean, [ClientSession | null]>;
}

interface MockLimit extends MockSession {
  limit: jest.Mock<MockSession, [number]>;
}

interface MockSort extends MockLimit {
  sort: jest.Mock<MockLimit, [Record<string, 1 | -1>]>;
}

const mockExec = jest.fn();
const mockLean = jest.fn((): MockExec => ({ exec: mockExec }));

let mockSort: jest.Mock<MockLimit, [Record<string, 1 | -1>]>;
let mockLimit: jest.Mock<MockSession, [number]>;

const mockSession = jest.fn(
  (
    session: ClientSession | null,
  ): MockLean & {
    sort: jest.Mock<MockLimit, [Record<string, 1 | -1>]>;
    limit: jest.Mock<MockSession, [number]>;
  } => ({
    lean: mockLean,
    exec: mockExec,
    sort: mockSort,
    limit: mockLimit,
  }),
);

mockSort = jest.fn(
  (sortArg: Record<string, 1 | -1>): MockLimit => ({
    lean: mockLean,
    exec: mockExec,
    limit: mockLimit,
    session: mockSession,
  }),
);

mockLimit = jest.fn(
  (
    limitArg: number,
  ): MockSession & {
    exec: jest.Mock;
    sort: jest.Mock<MockLimit, [Record<string, 1 | -1>]>;
  } => ({
    session: mockSession,
    exec: mockExec,
    lean: mockLean,
    sort: mockSort,
  }),
);

const mockModel = {
  create: jest.fn(),
  insertMany: jest.fn(),
  findByIdAndUpdate: jest.fn(() => ({ lean: mockLean, exec: mockExec })),
  findById: jest.fn(() => ({ lean: mockLean, exec: mockExec })),
  findOne: jest.fn(() => ({ lean: mockLean, exec: mockExec })),
  find: jest.fn(() => ({ lean: mockLean, sort: mockSort, exec: mockExec })),
  countDocuments: jest.fn(() => ({ session: mockSession, exec: mockExec })),
  updateOne: jest.fn(() => ({ exec: mockExec })),
  updateMany: jest.fn(() => ({ exec: mockExec })),
  findOneAndUpdate: jest.fn(() => ({ lean: mockLean, exec: mockExec })),
  deleteOne: jest.fn(() => ({ exec: mockExec })),
  deleteMany: jest.fn(() => ({ exec: mockExec })),
  distinct: jest.fn(() => ({ session: mockSession, exec: mockExec })),
  findOneAndDelete: jest.fn(() => ({ session: mockSession, exec: mockExec })),
  aggregate: jest.fn(() => ({ session: mockSession, exec: mockExec })),
} as unknown as Model<TestData>;

const mockClientSession = { id: 'mock-session-id' } as unknown as ClientSession;

describe('BaseRepo', () => {
  let testRepo: TestRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    testRepo = new TestRepo(mockModel);
  });

  describe('insert', () => {
    it('should call model.create and return the first doc as object', async () => {
      const data = { name: 'test', value: 1 };
      const createdDoc = {
        ...data,
        _id: '1',
        toObject: jest.fn(() => ({ ...data, _id: '1' })),
      };
      (mockModel.create as jest.Mock).mockResolvedValue([createdDoc]);

      const result = await testRepo.insert(data);

      expect(mockModel.create).toHaveBeenCalledWith([data], { session: null });
      expect(createdDoc.toObject).toHaveBeenCalled();
      expect(result).toEqual({ ...data, _id: '1' });
    });

    it('should call model.create with session', async () => {
      const data = { name: 'test', value: 1 };
      const createdDoc = {
        ...data,
        _id: '1',
        toObject: jest.fn(() => ({ ...data, _id: '1' })),
      };
      (mockModel.create as jest.Mock).mockResolvedValue([createdDoc]);

      await testRepo.insert(data, mockClientSession);

      expect(mockModel.create).toHaveBeenCalledWith([data], {
        session: mockClientSession,
      });
    });
  });

  describe('insertOne', () => {
    it('should call model.create and return the first doc', async () => {
      const data = { name: 'test', value: 1 };
      const createdDoc = { ...data, _id: '1' };
      (mockModel.create as jest.Mock).mockResolvedValue([createdDoc]);

      const result = await testRepo.insertOne(data);

      expect(mockModel.create).toHaveBeenCalledWith([data], { session: null });
      expect(result).toEqual(createdDoc);
    });

    it('should call model.create with session', async () => {
      const data = { name: 'test', value: 1 };
      const createdDoc = { ...data, _id: '1' };
      (mockModel.create as jest.Mock).mockResolvedValue([createdDoc]);

      await testRepo.insertOne(data, mockClientSession);

      expect(mockModel.create).toHaveBeenCalledWith([data], {
        session: mockClientSession,
      });
    });
  });

  describe('insertMany', () => {
    it('should call model.insertMany', async () => {
      const data = [
        { name: 'test1', value: 1 },
        { name: 'test2', value: 2 },
      ];
      await testRepo.insertMany(data);
      expect(mockModel.insertMany).toHaveBeenCalledWith(data, {
        session: null,
      });
    });

    it('should call model.insertMany with session', async () => {
      const data = [{ name: 'test1', value: 1 }];
      await testRepo.insertMany(data, mockClientSession);
      expect(mockModel.insertMany).toHaveBeenCalledWith(data, {
        session: mockClientSession,
      });
    });
  });

  describe('findById', () => {
    it('should call model.findById with lean and exec', async () => {
      const id = 'test-id';
      await testRepo.findById(id);
      expect(mockModel.findById).toHaveBeenCalledWith(
        id,
        {},
        { session: null },
      );
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.findById with options and session', async () => {
      const id = 'test-id';
      const options = { projection: { name: 1 } };
      await testRepo.findById(id, options, mockClientSession);
      expect(mockModel.findById).toHaveBeenCalledWith(
        id,
        {},
        { ...options, session: mockClientSession },
      );
    });
  });

  describe('findOne', () => {
    it('should call model.findOne with lean and exec', async () => {
      const query = { name: 'test' };
      await testRepo.findOne(query);
      expect(mockModel.findOne).toHaveBeenCalledWith(query, null, {
        session: null,
      });
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.findOne with options and session', async () => {
      const query = { name: 'test' };
      const options = { sort: { value: -1 } };
      await testRepo.findOne(query, options, mockClientSession);
      expect(mockModel.findOne).toHaveBeenCalledWith(query, null, {
        ...options,
        session: mockClientSession,
      });
    });
  });

  describe('find', () => {
    it('should call model.find with session', async () => {
      const query = { value: { $gt: 0 } };
      const options = { limit: 10 };
      await testRepo.find(query, options, mockClientSession);
      expect(mockModel.find).toHaveBeenCalledWith(
        query,
        null,
        expect.objectContaining({ ...options, session: mockClientSession }),
      );
    });
  });

  describe('updateOne', () => {
    it('should call model.updateOne with exec', async () => {
      const findQuery = { name: 'test' };
      const updateQuery = { $set: { value: 2 } };
      await testRepo.updateOne(findQuery, updateQuery);
      expect(mockModel.updateOne).toHaveBeenCalledWith(findQuery, updateQuery, {
        session: undefined,
      });
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.updateOne with session', async () => {
      const findQuery = { name: 'test' };
      const updateQuery = { $set: { value: 2 } };
      await testRepo.updateOne(findQuery, updateQuery, mockClientSession);
      expect(mockModel.updateOne).toHaveBeenCalledWith(findQuery, updateQuery, {
        session: mockClientSession,
      });
    });
  });

  describe('findOneAndUpdate', () => {
    it('should call model.findOneAndUpdate with new:true, lean and exec', async () => {
      const findQuery = { name: 'test' };
      const updateQuery = { $inc: { value: 1 } };
      const options = { sort: { createdAt: 1 } };
      await testRepo.findOneAndUpdate({ findQuery, updateQuery, options });
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        findQuery,
        updateQuery,
        expect.objectContaining({ ...options, new: true, session: null }),
      );
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.findOneAndUpdate with session and populate', async () => {
      const findQuery = { name: 'test' };
      const updateQuery = { $inc: { value: 1 } };
      const populate = { path: 'details' };
      await testRepo.findOneAndUpdate({
        findQuery,
        updateQuery,
        populate,
        session: mockClientSession,
      });
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        findQuery,
        updateQuery,
        expect.objectContaining({
          new: true,
          session: mockClientSession,
          ...populate,
        }),
      );
    });
  });

  describe('deleteOne', () => {
    it('should call model.deleteOne with exec', async () => {
      const query = { name: 'test' };
      await testRepo.deleteOne(query);
      expect(mockModel.deleteOne).toHaveBeenCalledWith(query, {
        session: undefined,
      });
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.deleteOne with session', async () => {
      const query = { name: 'test' };
      await testRepo.deleteOne(query, mockClientSession);
      expect(mockModel.deleteOne).toHaveBeenCalledWith(query, {
        session: mockClientSession,
      });
    });
  });

  describe('count', () => {
    it('should call model.countDocuments', async () => {
      const query = { name: 'test' };
      await testRepo.count(query);
      expect(mockModel.countDocuments).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.countDocuments with session', async () => {
      const query = { name: 'test' };
      await testRepo.count(query, mockClientSession);
      expect(mockModel.countDocuments).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(mockClientSession);
    });
  });

  describe('aggregate', () => {
    it('should call model.aggregate', async () => {
      const pipeline = [{ $match: { name: 'test' } }];
      await testRepo.aggregate(pipeline);
      expect(mockModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.aggregate with session', async () => {
      const pipeline = [{ $match: { name: 'test' } }];
      await testRepo.aggregate(pipeline, mockClientSession);
      expect(mockModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(mockSession).toHaveBeenCalledWith(mockClientSession);
    });
  });

  describe('findOneAndDelete', () => {
    const query = { name: 'to-delete' };

    it('should call model.findOneAndDelete with query, session, exec', async () => {
      await testRepo.findOneAndDelete(query);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.findOneAndDelete with session', async () => {
      await testRepo.findOneAndDelete(query, mockClientSession);
      expect(mockModel.findOneAndDelete).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(mockClientSession);
    });
  });

  describe('distinct', () => {
    const key = 'name';
    const query = { value: { $gt: 10 } };

    it('should call model.distinct with key, query, session, exec', async () => {
      await testRepo.distinct(key, query);
      expect(mockModel.distinct).toHaveBeenCalledWith(key, query);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.distinct with session', async () => {
      await testRepo.distinct(key, query, mockClientSession);
      expect(mockModel.distinct).toHaveBeenCalledWith(key, query);
      expect(mockSession).toHaveBeenCalledWith(mockClientSession);
    });
  });

  describe('deleteMany', () => {
    const query = { value: { $lt: 5 } };

    it('should call model.deleteMany with query and exec', async () => {
      await testRepo.deleteMany(query);
      expect(mockModel.deleteMany).toHaveBeenCalledWith(query, {
        session: undefined,
      });
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.deleteMany with session', async () => {
      await testRepo.deleteMany(query, mockClientSession);
      expect(mockModel.deleteMany).toHaveBeenCalledWith(query, {
        session: mockClientSession,
      });
    });
  });

  describe('findOneAndUpdate (default populate)', () => {
    it('should call model.findOneAndUpdate with default empty populate', async () => {
      const findQuery = { name: 'test-default-populate' };
      const updateQuery = { $set: { value: 99 } };
      await testRepo.findOneAndUpdate({ findQuery, updateQuery });
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        findQuery,
        updateQuery,
        expect.objectContaining({ new: true, session: null }),
      );
      expect(mockModel.findOneAndUpdate).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ path: expect.anything() }),
      );
    });
  });

  describe('countWithConditionalQuery', () => {
    const query = { value: { $gt: 10 } };

    it('should call model.countDocuments with query, session, exec', async () => {
      await testRepo.countWithConditionalQuery(query);
      expect(mockModel.countDocuments).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.countDocuments with session', async () => {
      await testRepo.countWithConditionalQuery(query, mockClientSession);
      expect(mockModel.countDocuments).toHaveBeenCalledWith(query);
      expect(mockSession).toHaveBeenCalledWith(mockClientSession);
    });
  });

  describe('findMostRecent', () => {
    it('should call model.find, sort, limit, session, exec', async () => {
      const findMock = jest.fn(() => ({
        sort: mockSort,
      }));
      (mockModel.find as jest.Mock) = findMock;
      mockSort.mockReturnValueOnce({ limit: mockLimit } as any);
      mockLimit.mockReturnValueOnce({ session: mockSession } as any);
      mockSession.mockReturnValueOnce({ exec: mockExec } as any);

      await testRepo.findMostRecent();

      expect(mockModel.find).toHaveBeenCalledWith();
      expect(mockSort).toHaveBeenCalledWith({ _id: -1 });
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockSession).toHaveBeenCalledWith(null);
      expect(mockExec).toHaveBeenCalled();

      (mockModel.find as jest.Mock) = jest.fn(() => ({
        lean: mockLean,
        sort: mockSort,
        exec: mockExec,
      }));
    });

    it('should call findMostRecent with session', async () => {
      const findMock = jest.fn(() => ({ sort: mockSort }));
      (mockModel.find as jest.Mock) = findMock;
      mockSort.mockReturnValueOnce({ limit: mockLimit } as any);
      mockLimit.mockReturnValueOnce({ session: mockSession } as any);
      mockSession.mockReturnValueOnce({ exec: mockExec } as any);

      await testRepo.findMostRecent(mockClientSession);

      expect(mockSession).toHaveBeenCalledWith(mockClientSession);

      (mockModel.find as jest.Mock) = jest.fn(() => ({
        lean: mockLean,
        sort: mockSort,
        exec: mockExec,
      }));
    });
  });

  describe('search', () => {
    const query = { name: /test/i };
    const options = { limit: 5, skip: 1 };

    it('should call model.find with query, options, sort, lean, exec', async () => {
      await testRepo.search(query, options);
      expect(mockModel.find).toHaveBeenCalledWith(
        query,
        null,
        expect.objectContaining({
          sort: { createdAt: 'desc' },
          ...options,
          session: null,
        }),
      );
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.find with session', async () => {
      await testRepo.search(query, options, mockClientSession);
      expect(mockModel.find).toHaveBeenCalledWith(
        query,
        null,
        expect.objectContaining({
          sort: { createdAt: 'desc' },
          ...options,
          session: mockClientSession,
        }),
      );
    });
  });

  describe('findByIdAndUpdate', () => {
    const id = 'test-id-123';
    const updateQuery = { $set: { value: 100 } };

    it('should call model.findByIdAndUpdate with id, update, new:true, lean, exec', async () => {
      await testRepo.findByIdAndUpdate(id, updateQuery);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateQuery,
        expect.objectContaining({ new: true, session: null }),
      );
      expect(mockLean).toHaveBeenCalled();
      expect(mockExec).toHaveBeenCalled();
    });

    it('should call model.findByIdAndUpdate with options', async () => {
      const options = { sort: { name: 1 } };
      await testRepo.findByIdAndUpdate(id, updateQuery, options);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateQuery,
        expect.objectContaining({ ...options, new: true, session: null }),
      );
    });

    it('should call model.findByIdAndUpdate with populate', async () => {
      const populate = { path: 'details' };
      await testRepo.findByIdAndUpdate(id, updateQuery, undefined, populate);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateQuery,
        expect.objectContaining({ new: true, session: null, ...populate }),
      );
    });

    it('should call model.findByIdAndUpdate with session', async () => {
      await testRepo.findByIdAndUpdate(
        id,
        updateQuery,
        undefined,
        undefined,
        mockClientSession,
      );
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateQuery,
        expect.objectContaining({ new: true, session: mockClientSession }),
      );
    });
  });
});
