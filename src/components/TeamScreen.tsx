import React from 'react';
import { motion } from 'motion/react';
import { Mail, Briefcase, CheckCircle2, ListTodo, ShieldAlert } from 'lucide-react';
import { User, Task } from '../types';

interface TeamScreenProps {
  users: User[];
  tasks: Task[];
}

export default function TeamScreen({ users, tasks }: TeamScreenProps) {
  
  const getTasksCountForUser = (userId: string) => {
    const userTasks = tasks.filter((t) => (t.assigneeIds && t.assigneeIds.includes(userId)) || t.assigneeId === userId);
    const pending = userTasks.filter((t) => t.status !== 'done').length;
    const completed = userTasks.filter((t) => t.status === 'done').length;
    return { pending, completed, total: userTasks.length };
  };

  return (
    <div className="space-y-6" id="team-screen-root">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          Team Members
        </h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
          The collaborative force powering TaskFlow task execution and product releases.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="team-members-grid">
        {users.map((user) => {
          const { pending, completed, total } = getTasksCountForUser(user.id);
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-[#E2E8F0] dark:border-slate-700 p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              id={`team-member-card-${user.id}`}
            >
              {/* Header profile details */}
              <div className="flex gap-4">
                {/* Large Custom Initials Avatar */}
                <div 
                  className="w-14 h-14 rounded flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.initials}
                </div>

                <div className="min-w-0 space-y-1">
                  <h3 className="font-bold text-base text-[#0F172A] dark:text-white truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-400">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Counts footer stats breakdown */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E2E8F0] dark:border-slate-700/50 text-center bg-[#F8FAFC] dark:bg-slate-900/40 -mx-5 -mb-5 p-4 rounded-b-lg">
                <div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {total}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">
                    Assigned
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2563EB]">
                    {pending}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">
                    Active
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    {completed}
                  </div>
                  <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">
                    Done
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
