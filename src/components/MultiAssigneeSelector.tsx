import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, X, Users, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface MultiAssigneeSelectorProps {
  users: User[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  id?: string;
  placeholder?: string;
}

export default function MultiAssigneeSelector({
  users,
  selectedIds,
  onChange,
  id = 'multi-assignee-selector',
  placeholder = 'Select Assignees...',
}: MultiAssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onChange(selectedIds.filter((id) => id !== userId));
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {/* Selector Trigger Input Area */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-md p-2 text-xs text-[#0F172A] dark:text-slate-200 focus-within:ring-1 focus-within:ring-[#283657] focus-within:border-[#283657] cursor-pointer min-h-[38px] flex flex-wrap items-center gap-1.5"
      >
        {selectedUsers.length === 0 ? (
          <span className="text-slate-400 dark:text-slate-500 pl-1">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials}
                </span>
                <span className="max-w-[80px] truncate text-slate-850 dark:text-slate-150">{user.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeUser(e, user.id)}
                  className="text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5 ml-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg shadow-lg z-50 p-2 space-y-2 max-h-60 flex flex-col">
          {/* Dropdown Search Bar */}
          <div className="relative flex items-center shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-slate-900 text-xs pl-8 pr-2.5 py-1.5 rounded-md border border-[#E2E8F0] dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#283657]"
              placeholder="Search team members..."
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on search input click
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* User Options List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50 dark:divide-slate-750/30">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">No team members found</div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Initials Avatar */}
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-xs shrink-0"
                        style={{ backgroundColor: user.avatarColor }}
                      >
                        {user.initials}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-slate-100">{user.name}</div>
                        <div className="text-[10px] text-[#64748B] dark:text-slate-400">{user.role}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
