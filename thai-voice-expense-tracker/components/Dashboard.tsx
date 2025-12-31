import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        expense += t.amount;
        if (categoryMap[t.category]) {
          categoryMap[t.category] += t.amount;
        } else {
          categoryMap[t.category] = t.amount;
        }
      }
    });

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return { income, expense, balance: income - expense, categoryData };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
        <p className="text-blue-100 text-sm font-medium mb-1">Total Balance</p>
        <h2 className="text-3xl font-bold">{formatCurrency(summary.balance)}</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-sm">Income</p>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Total</span>
        </div>
        <p className="text-2xl font-bold text-green-600">+{formatCurrency(summary.income)}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-sm">Expenses</p>
          <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Total</span>
        </div>
        <p className="text-2xl font-bold text-red-600">-{formatCurrency(summary.expense)}</p>
      </div>

      {/* Chart Section - Spans full width on mobile, 2 cols on desktop if data exists */}
      {summary.categoryData.length > 0 && (
        <div className="md:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {summary.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
