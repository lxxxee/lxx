import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from './types';
import VoiceRecorder from './components/VoiceRecorder';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import ConfirmationDialog from './components/ConfirmationDialog';
import { generateCSV, generateTSV, downloadCSV } from './utils';
import { LayoutDashboard, Table, Download, Plus, Bot, ExternalLink, Copy, Check } from 'lucide-react';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/1-7vACHs8q81HgBZVto1LHbAZ-j1yyyI7ghxo7RRzBFM/edit?usp=sharing";

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[] | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sheet'>('dashboard');
  const [copied, setCopied] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('transactions');
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleTransactionsParsed = useCallback((newTransactions: Transaction[]) => {
    setPendingTransactions(newTransactions);
  }, []);

  const handleConfirmTransactions = (finalTransactions: Transaction[]) => {
    setTransactions(prev => [...finalTransactions, ...prev]);
    setPendingTransactions(null);
  };

  const handleCancelConfirmation = () => {
    setPendingTransactions(null);
  };

  const handleDelete = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleExport = () => {
    if (transactions.length === 0) {
      alert("No data to export");
      return;
    }
    const csv = generateCSV(transactions);
    const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const handleCopyToClipboard = () => {
    if (transactions.length === 0) {
      alert("No data to copy");
      return;
    }
    const tsv = generateTSV(transactions);
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-800">VoiceCPA</span>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={SHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                title="Open Linked Google Sheet"
              >
                <ExternalLink size={16} />
                <span className="hidden lg:inline">Open Sheet</span>
              </a>

              <div className="h-6 w-px bg-gray-200 hidden md:block mx-1"></div>

              <button 
                onClick={handleCopyToClipboard}
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-200 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                title="Copy data to paste into Sheets"
              >
                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Data"}</span>
              </button>

              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Confirmation Step */}
        {pendingTransactions && (
          <div className="mb-8">
            <ConfirmationDialog 
              transactions={pendingTransactions} 
              onConfirm={handleConfirmTransactions}
              onCancel={handleCancelConfirmation}
            />
          </div>
        )}

        {/* Intro / Recorder Section */}
        <div className="flex flex-col items-center mb-10">
          <VoiceRecorder onTransactionsParsed={handleTransactionsParsed} />
        </div>

        {/* Content Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`${
                activeTab === 'sheet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              <Table size={18} />
              Sheet Data
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'dashboard' ? (
            <Dashboard transactions={transactions} />
          ) : (
            <div className="space-y-4">
               <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                  <ExternalLink className="text-blue-600 mt-0.5 flex-shrink-0" size={18} />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Sync with Google Sheets</p>
                    <p className="mt-1">
                      1. Click <strong>"Copy Data"</strong> in the top right.<br/>
                      2. <a href={SHEET_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Open your Google Sheet</a>.<br/>
                      3. Select a cell and press <strong>Ctrl+V</strong> (Cmd+V) to paste your transactions.
                    </p>
                  </div>
               </div>
               <TransactionList transactions={transactions} onDelete={handleDelete} />
            </div>
          )}
        </div>
      </main>

      {/* Floating Plus Button for manual entry */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default App;