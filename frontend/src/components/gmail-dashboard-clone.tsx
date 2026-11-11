"use client"
import { useState, useEffect } from 'react';
import { Mail, Star, Inbox, FileText, Menu, X } from 'lucide-react';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Adjust the import path as necessary

interface Email {
  id: string;
  sender: string;
  subject: string;
  time: string;
  preview: string;
  isRead: boolean;
  isSelected: boolean;
  isStarred: boolean;
  safety: 'safe' | 'unsafe';
}

export default function GmailDashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filter, setFilter] = useState<'all' | 'safe' | 'unsafe'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      // const querySnapshot = await getDocs(collection(db, "emails"));
      // const emailsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Email));
      // setEmails(emailsData);
      
    };

    fetchEmails();
  }, []);

  const handleSelectAll = () => {
    setEmails(emails.map(email => ({
      ...email,
      isSelected: !emails.every(e => e.isSelected)
    })));
  };

  const handleFilter = (safetyType: 'all' | 'safe' | 'unsafe') => {
    setFilter(safetyType);
  };

  const filteredEmails = filter === 'all' 
    ? emails 
    : emails.filter(email => email.safety === filter);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`fixed inset-0 z-50 bg-white dark:bg-gray-900 transition-transform transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-64 p-4 border-r border-gray-200 dark:border-gray-700`}>
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <button className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:shadow-md transition-all mb-4">
            <FileText className="w-5 h-5" />
            <span>Compose</span>
          </button>

          <div className="space-y-1">
            <button 
              onClick={() => handleFilter('all')} 
              className={`flex items-center space-x-3 px-6 py-2 rounded-r-full w-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                filter === 'all' ? 'bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : ''
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span>All</span>
            </button>
            <button 
              onClick={() => handleFilter('safe')} 
              className={`flex items-center space-x-3 px-6 py-2 rounded-r-full w-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                filter === 'safe' ? 'bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : ''
              }`}
            >
              <Star className="w-5 h-5 text-green-600" />
              <span>Safe</span>
            </button>
            <button 
              onClick={() => handleFilter('unsafe')} 
              className={`flex items-center space-x-3 px-6 py-2 rounded-r-full w-full hover:bg-gray-100 dark:hover:bg-gray-800 ${
                filter === 'unsafe' ? 'bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : ''
              }`}
            >
              <Star className="w-5 h-5 text-red-600" />
              <span>Unsafe</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="text-sm text-gray-600 dark:text-gray-400">1-{filteredEmails.length} of {filteredEmails.length}</div>
          </div>

          {/* Email List Header */}
          
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 dark:border-gray-600"
                checked={emails.every(email => email.isSelected)}
                onChange={handleSelectAll}
              />
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400">1-{filteredEmails.length} of {filteredEmails.length}</div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`flex items-center px-4 py-2 hover:shadow-md cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                  email.isRead ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800 font-semibold'
                }`}
              >
                <input 
                  type="checkbox" 
                  className="mr-4 rounded border-gray-300 dark:border-gray-600"
                  checked={email.isSelected}
                  onChange={() => {
                    setEmails(emails.map(e => 
                      e.id === email.id ? {...e, isSelected: !e.isSelected} : e
                    ));
                  }}
                />
                <Star
                  className={`w-5 h-5 mr-4 ${
                    email.isStarred ? 'text-yellow-400' : 'text-gray-400 dark:text-gray-600'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="w-48 truncate">{email.sender}</span>
                    <span className="flex-1 truncate">{email.subject}</span>
                    <span className="ml-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {email.time}
                    </span>
                    {/* Safety Label */}
                    <span 
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        email.safety === 'safe' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}
                    >
                      {email.safety.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{email.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden" onClick={() => setIsDrawerOpen(false)} />
      )}
    </div>
  );
}