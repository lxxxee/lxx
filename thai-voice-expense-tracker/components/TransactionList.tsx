import React from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-400">No transactions recorded yet.</p>
        <p className="text-gray-400 text-sm mt-1">Use the microphone to add some!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{transactions.length} entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{t.date}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{t.description}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center justify-end gap-1">
                    {t.type === TransactionType.INCOME ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                    {t.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
