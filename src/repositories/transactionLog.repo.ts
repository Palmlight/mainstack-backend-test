import {
  ITransactionLog,
  TransactionLogModel,
} from '@/models/TransactionLog.model';
import BaseRepo from './base.repo';

class TransactionLogRepo extends BaseRepo<ITransactionLog> {
  constructor() {
    super(TransactionLogModel);
  }
}
export default TransactionLogRepo;
