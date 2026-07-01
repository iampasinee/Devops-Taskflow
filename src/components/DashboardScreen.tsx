import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, Clock, AlertTriangle, Calendar, 
  ArrowRight, ListTodo, Search, Filter, User as UserIcon, Flame,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Task, Project, User, Priority, Status } from '../types';

interface DashboardScreenProps {
  currentUser: User;
  tasks: Task[];
  projects: Project[];
  users: User[];
  onOpenTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: Status) => void;
}

export default function DashboardScreen({
  currentUser,
  tasks,
  projects,
  users,
  onOpenTask,
  onUpdateTaskStatus,
}: DashboardScreenProps) {
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'deadline' | 'status'>('deadline');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter((t) => (t.assigneeIds && t.assigneeIds.includes(currentUser.id)) || t.assigneeId === currentUser.id);

  // Date constants (current local date from system metadata: 2026-07-01)
  const TODAY_STR = '2026-07-01';

  // KPI Calculations
  const assignedToMeCount = myTasks.length;
  
  const dueTodayCount = myTasks.filter(
    (t) => t.deadline === TODAY_STR && t.status !== 'done'
  ).length;

  const overdueCount = myTasks.filter((t) => {
    if (t.status === 'done' || !t.deadline) return false;
    return t.deadline < TODAY_STR;
  }).length;

  // Completed this week: status === 'done'. Let's say done tasks in general for client-side stats.
  const completedCount = myTasks.filter((t) => t.status === 'done').length;

  // Status breakdown calculations
  const todoCount = myTasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = myTasks.filter((t) => t.status === 'in_review').length;
  const doneCount = myTasks.filter((t) => t.status === 'done').length;

  const totalMyTasks = myTasks.length;
  const getPercentage = (count: number) => {
    if (totalMyTasks === 0) return 0;
    return Math.round((count / totalMyTasks) * 100);
  };

  // Sort tasks
  const sortedTasks = [...myTasks].sort((a, b) => {
    let result = 0;
    if (sortBy === 'title') {
      result = a.title.localeCompare(b.title);
    } else if (sortBy === 'deadline') {
      if (!a.deadline) result = 1;
      else if (!b.deadline) result = -1;
      else result = a.deadline.localeCompare(b.deadline);
    } else if (sortBy === 'priority') {
      const priorityWeights = { urgent: 4, high: 3, medium: 2, low: 1 };
      result = priorityWeights[a.priority] - priorityWeights[b.priority];
    } else if (sortBy === 'status') {
      const statusWeights = { todo: 1, in_progress: 2, in_review: 3, done: 4 };
      result = statusWeights[a.status] - statusWeights[b.status];
    }
    return sortDir === 'asc' ? result : -result;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);
  const displayPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (displayPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTasks = sortedTasks.slice(startIndex, endIndex);

  const handleSort = (field: 'title' | 'priority' | 'deadline' | 'status') => {
    setCurrentPage(1);
    if (sortBy === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      // default directions for fields:
      if (field === 'priority' || field === 'deadline') {
        setSortDir('desc');
      } else {
        setSortDir('asc');
      }
    }
  };

  const renderSortIcon = (field: 'title' | 'priority' | 'deadline' | 'status') => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover/th:opacity-100 transition-opacity ml-1.5 inline-block shrink-0" />;
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-[#2563EB] dark:text-blue-450 ml-1.5 inline-block shrink-0" /> 
      : <ArrowDown className="w-3 h-3 text-[#2563EB] dark:text-blue-450 ml-1.5 inline-block shrink-0" />;
  };

  // Helpers for styling
  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50';
      case 'high': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'medium': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
      case 'low': return 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
    }
  };

  const getDeadlineChip = (deadline: string, status: Status) => {
    if (status === 'done') return 'text-slate-400 dark:text-slate-500 line-through';
    if (!deadline) return 'text-slate-400 dark:text-slate-500';
    if (deadline < TODAY_STR) return 'text-red-600 dark:text-red-400 font-semibold flex items-center gap-1';
    if (deadline === TODAY_STR) return 'text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1';
    return 'text-slate-600 dark:text-slate-400 flex items-center gap-1';
  };

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case 'todo': return 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-450 border border-slate-200 dark:border-slate-800';
      case 'in_progress': return 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-450 border border-blue-200 dark:border-blue-900/50';
      case 'in_review': return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 border border-amber-200 dark:border-amber-900/50';
      case 'done': return 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-450 border border-green-200 dark:border-green-900/50';
    }
  };

  const getStatusLabel = (status: Status) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'in_review': return 'In Review';
      case 'done': return 'Done';
    }
  };

  return (
    <div className="space-y-6" id="dashboard-root">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            Hello, {currentUser.name} 👋
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Here's a snapshot of your tasks and team progress for today.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-row">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[#64748B] dark:text-slate-400">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">{assignedToMeCount}</div>
            <div className="text-xs font-medium text-[#64748B]">My Tasks</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[#64748B] dark:text-slate-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">{dueTodayCount}</div>
            <div className="text-xs font-medium text-[#64748B]">Due Today</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">{overdueCount}</div>
            <div className="text-xs font-medium text-[#64748B]">Overdue</div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">{completedCount}</div>
            <div className="text-xs font-medium text-[#64748B]">Completed</div>
          </div>
        </div>
      </div>

      {/* Main Layout: My Tasks & Status mini widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Tasks list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-base text-[#0F172A] dark:text-white">
              My Action Items
            </h2>

            {sortedTasks.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3" id="dashboard-empty-state">
                <div className="text-4xl">🎉</div>
                <h3 className="font-semibold text-[#0F172A] dark:text-slate-200">
                  You're all caught up!
                </h3>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto">
                  No pending tasks assigned to you. Go celebrate or grab a coffee!
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6" id="dashboard-my-tasks-table-container">
                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC]/50 dark:bg-slate-900/20 text-[#64748B] dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th 
                        className="py-3.5 px-6 select-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors group/th"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          <span>Task Title</span>
                          {renderSortIcon('title')}
                        </div>
                      </th>
                      <th 
                        className="py-3.5 px-6 select-none w-28 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors group/th"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center">
                          <span>Priority</span>
                          {renderSortIcon('priority')}
                        </div>
                      </th>
                      <th 
                        className="py-3.5 px-6 select-none w-36 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors group/th"
                        onClick={() => handleSort('deadline')}
                      >
                        <div className="flex items-center">
                          <span>Deadline</span>
                          {renderSortIcon('deadline')}
                        </div>
                      </th>
                      <th 
                        className="py-3.5 px-6 select-none w-32 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850/60 transition-colors group/th"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          <span>Status</span>
                          {renderSortIcon('status')}
                        </div>
                      </th>
                      <th className="py-3.5 px-6 text-right select-none w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50" id="dashboard-my-tasks-table-body">
                    {paginatedTasks.map((task) => {
                      const proj = projects.find((p) => p.id === task.projectId);
                      return (
                        <tr 
                          key={task.id}
                          className="hover:bg-[#F8FAFC] dark:hover:bg-slate-900/30 transition-colors group"
                        >
                          {/* Task Title */}
                          <td className="py-3.5 px-6 max-w-[280px]">
                            <div className="min-w-0 space-y-1">
                              <button
                                onClick={() => onOpenTask(task.id)}
                                className={`font-semibold text-xs text-left hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors truncate block w-full ${
                                  task.status === 'done' ? 'text-[#64748B] dark:text-slate-500' : 'text-[#0F172A] dark:text-slate-200'
                                }`}
                                id={`btn-open-task-${task.id}`}
                              >
                                {task.title}
                              </button>
                              <div className="flex items-center gap-2">
                                <span 
                                  className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-white truncate max-w-[120px]"
                                  style={{ backgroundColor: proj?.color || '#2563EB' }}
                                  title={proj?.name || 'TaskFlow'}
                                >
                                  {proj?.name || 'TaskFlow'}
                                </span>
                                <span className="font-mono text-[9px] text-[#64748B]">
                                  {task.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-6 align-middle">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>

                          {/* Deadline */}
                          <td className="py-3.5 px-6 align-middle">
                            <div className={`text-xs inline-flex items-center gap-1.5 ${getDeadlineChip(task.deadline, task.status)}`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {task.deadline ? (
                                  task.deadline === TODAY_STR ? 'Today' : task.deadline
                                ) : (
                                  'No Date'
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Initial Status */}
                          <td className="py-3.5 px-6 align-middle">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block ${getStatusBadgeClass(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-6 text-right align-middle">
                            <button
                              onClick={() => onOpenTask(task.id)}
                              className="text-[#64748B] hover:text-[#2563EB] dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md inline-flex items-center justify-center transition-all cursor-pointer"
                              title="View Details"
                              id={`btn-view-details-arrow-${task.id}`}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800" id="dashboard-my-tasks-pagination">
                {/* Items per page selector */}
                <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700/80 text-[#0F172A] dark:text-slate-200 text-xs rounded-md p-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                    id="select-items-per-page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>tasks per page</span>
                </div>

                {/* Info Text & Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-xs text-[#64748B] dark:text-slate-400 text-center sm:text-left">
                    Showing <span className="font-semibold text-[#0F172A] dark:text-slate-200">{Math.min(startIndex + 1, sortedTasks.length)}</span> to{' '}
                    <span className="font-semibold text-[#0F172A] dark:text-slate-200">{Math.min(endIndex, sortedTasks.length)}</span> of{' '}
                    <span className="font-semibold text-[#0F172A] dark:text-slate-200">{sortedTasks.length}</span> tasks
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={displayPage === 1}
                      className={`p-1.5 rounded-md border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer ${
                        displayPage === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 text-[#94A3B8]'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-[#64748B] dark:hover:text-slate-200'
                      }`}
                      id="btn-pagination-prev"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      if (totalPages > 5) {
                        if (
                          pageNum !== 1 &&
                          pageNum !== totalPages &&
                          Math.abs(pageNum - displayPage) > 1
                        ) {
                          if (pageNum === 2 && displayPage > 3) {
                            return (
                              <span key="ellipsis-start" className="text-xs text-[#64748B] px-1 select-none">
                                ...
                              </span>
                            );
                          }
                          if (pageNum === totalPages - 1 && displayPage < totalPages - 2) {
                            return (
                              <span key="ellipsis-end" className="text-xs text-[#64748B] px-1 select-none">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      }

                      const isActive = pageNum === displayPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 text-xs font-semibold rounded-md flex items-center justify-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                              : 'border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#64748B] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                          }`}
                          id={`btn-pagination-page-${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={displayPage === totalPages}
                      className={`p-1.5 rounded-md border border-[#E2E8F0] dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer ${
                        displayPage === totalPages
                          ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 text-[#94A3B8]'
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-[#64748B] dark:hover:text-slate-200'
                      }`}
                      id="btn-pagination-next"
                      title="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>)}
          </div>
        </div>

        {/* Right column: Status Breakdown mini widget */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-base text-[#0F172A] dark:text-white">
              Your Workload Health
            </h2>

            {totalMyTasks === 0 ? (
              <div className="text-center py-6 text-[#64748B] text-xs">
                No active tasks to calculate health.
              </div>
            ) : (
              <div className="space-y-5" id="workload-stats-widget">
                
                {/* Visual Bar Graph */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#64748B] font-medium">
                    <span>Task Distribution</span>
                    <span>{totalMyTasks} tasks total</span>
                  </div>
                  
                  {/* Master Progress stack bar */}
                  <div className="h-3.5 w-full rounded-md bg-slate-100 dark:bg-slate-700 flex overflow-hidden">
                    <div 
                      className="bg-slate-400 h-full hover:opacity-90 transition-opacity cursor-help" 
                      style={{ width: `${getPercentage(todoCount)}%` }}
                      title={`To Do: ${todoCount} tasks (${getPercentage(todoCount)}%)`}
                    />
                    <div 
                      className="bg-[#2563EB] h-full hover:opacity-90 transition-opacity cursor-help" 
                      style={{ width: `${getPercentage(inProgressCount)}%` }}
                      title={`In Progress: ${inProgressCount} tasks (${getPercentage(inProgressCount)}%)`}
                    />
                    <div 
                      className="bg-amber-500 h-full hover:opacity-90 transition-opacity cursor-help" 
                      style={{ width: `${getPercentage(inReviewCount)}%` }}
                      title={`In Review: ${inReviewCount} tasks (${getPercentage(inReviewCount)}%)`}
                    />
                    <div 
                      className="bg-green-500 h-full hover:opacity-90 transition-opacity cursor-help" 
                      style={{ width: `${getPercentage(doneCount)}%` }}
                      title={`Done: ${doneCount} tasks (${getPercentage(doneCount)}%)`}
                    />
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-3 pt-2">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span className="font-medium text-[#64748B] dark:text-slate-300">To Do</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {todoCount} <span className="text-[#64748B] font-normal">({getPercentage(todoCount)}%)</span>
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                      <span className="font-medium text-[#64748B] dark:text-slate-300">In Progress</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {inProgressCount} <span className="text-[#64748B] font-normal">({getPercentage(inProgressCount)}%)</span>
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-medium text-[#64748B] dark:text-slate-300">In Review</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {inReviewCount} <span className="text-[#64748B] font-normal">({getPercentage(inReviewCount)}%)</span>
                    </span>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="font-medium text-[#64748B] dark:text-slate-300">Completed</span>
                    </div>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {doneCount} <span className="text-[#64748B] font-normal">({getPercentage(doneCount)}%)</span>
                    </span>
                  </div>
                </div>

                {/* Team Motivation Banner */}
                <div className="p-3.5 bg-[#EFF6FF] dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-md text-xs space-y-1 text-[#2563EB] dark:text-blue-300 flex items-start gap-2.5 font-medium">
                  <Flame className="w-4 h-4 text-[#2563EB] dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Did you know?</span> Keeping your status updated helps the PM alex@taskflow.app maintain clear team deadlines!
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
