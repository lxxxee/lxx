import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Check, X, Save, Trash2, Tag, CreditCard, AlignLeft } from 'lucide-react';

interface ConfirmationDialogProps {
  transactions: Transaction[];
  onConfirm: (transactions: Transaction[]) => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  transactions: initialTransactions, 
  onConfirm, 
  onCancel 
}) => {
  const [editedTransactions, setEditedTransactions] = useState<Transaction[]>(initialTransactions);

  const handleUpdate = (id: string, field: keyof Transaction, value: any) => {
    setEditedTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const handleRemove = (id: string) => {
    const remaining = editedTransactions.filter(t => t.id !== id);
    if (remaining.length === 0) {
      onCancel();
    } else {
      setEditedTransactions(remaining);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 px-6 py-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">ยืนยันรายการ (Review)</h3>
              <p className="text-blue-100 text-xs opacity-90">ตรวจสอบข้อมูลที่ AI สรุปให้</p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
            title="Cancel"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 bg-gray-50/50">
          <div className="space-y-3">
            {editedTransactions.map((t) => (
              <div 
                key={t.id} 
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 group transition-all hover:border-blue-200"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Left Column: Description & Type */}
                  <div className="flex-1 space-y-3">
                    <div className="relative">
                      <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <AlignLeft size={10} /> Description
                      </label>
                      <input 
                        type="text" 
                        value={t.description}
                        onChange={(e) => handleUpdate(t.id, 'description', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-800 font-medium transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleUpdate(t.id, 'type', t.type === TransactionType.EXPENSE ? TransactionType.INCOME : TransactionType.EXPENSE)}
                        className={`flex-1 md:flex-none px-4 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                          t.type === TransactionType.EXPENSE 
                            ? 'bg-red-50 text-red-600 border border-red-100' 
                            : 'bg-green-50 text-green-600 border border-green-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === TransactionType.EXPENSE ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        {t.type}
                      </button>
                      
                      <button 
                        onClick={() => handleRemove(t.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors md:ml-auto"
                        title="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Right Column: Amount & Category */}
                  <div className="w-full md:w-56 space-y-3">
                    <div className="relative">
                      <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <CreditCard size={10} /> Amount
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-gray-400 font-medium text-sm">฿</span>
                        <input 
                          type="number" 
                          value={t.amount}
                          onChange={(e) => handleUpdate(t.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-7 pr-3 py-2 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 font-bold transition-all text-right"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 flex items-center gap-1">
                        <Tag size={10} /> Category
                      </label>
                      <input 
                        type="text" 
                        value={t.category}
                        onChange={(e) => handleUpdate(t.id, 'category', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-600 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => onConfirm(editedTransactions)}
            className="flex-[2] bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} />
            บันทึกรายการ
          </button>
          <button 
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-600 font-bold py-4 rounded-2xl transition-all"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;