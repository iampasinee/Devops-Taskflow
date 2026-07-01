import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MessageSquare, AlertCircle, Calendar, ArrowRight, Folder } from 'lucide-react';
import { Task, Project, User, Priority, Status } from '../types';

interface SearchScreenProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  onOpenTaskDetail: (taskId: string) => void;
}

export default function SearchScreen({
  tasks,
  projects,
  users,
  searchQuery,
  onChangeSearchQuery,
  onOpenTaskDetail,
}: SearchScreenProps) {
  // Today's Date
  const TODAY_STR = '2026-07-01';

  // Filter tasks across all projects
  const matchedTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return false;
    const project = projects.find((p) => p.id === task.projectId);
    const taskAssignees = (task.assigneeIds && task.assigneeIds.length > 0)
      ? users.filter((u) => task.assigneeIds.includes(u.id))
      : (task.assigneeId ? users.filter((u) => u.id === task.assigneeId) : []);
    
    const matchesAssigneeName = taskAssignees.some(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      matchesAssigneeName
    );
  });

  const getPriorityBadgeClass = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-150';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-150';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'low': return 'bg-slate-50 text-slate-600 border-slate-150';
    }
  };

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'in_review': return 'bg-amber-100 text-amber-800';
      case 'done': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6" id="search-results-root">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
          Global Registry Search
        </h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
          Find tasks, projects, or assignee references instantly across the entire TaskFlow team environment.
        </p>
      </div>

      {/* Instant Search Bar */}
      <div className="relative max-w-xl bg-white dark:bg-slate-800 p-2 rounded-lg border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center">
        <Search className="w-5 h-5 text-[#64748B] ml-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onChangeSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-0 focus:ring-0 text-xs py-2 pl-2 text-[#0F172A] dark:text-slate-100 focus:outline-none"
          placeholder="Type task title, project name, or teammate name..."
          id="input-global-search-screen"
        />
        {searchQuery && (
          <button
            onClick={() => onChangeSearchQuery('')}
            className="text-xs text-[#64748B] hover:text-[#0F172A] font-bold px-3 py-1 bg-[#F8FAFC] hover:bg-slate-100 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Badges Display */}
      {searchQuery && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#64748B] font-semibold uppercase tracking-wider">Active Criteria:</span>
          <div className="inline-flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/20 rounded px-2.5 py-0.5 text-xs font-semibold">
            Query: "{searchQuery}"
            <button onClick={() => onChangeSearchQuery('')} className="hover:text-blue-700 text-[#2563EB] font-bold p-0.5 ml-1">×</button>
          </div>
          <button
            onClick={() => onChangeSearchQuery('')}
            className="text-xs text-[#64748B] hover:text-red-500 font-semibold transition-colors cursor-pointer"
          >
            Clear all criteria
          </button>
        </div>
      )}

      {/* Results output */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm">
        {!searchQuery.trim() ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="text-4xl">🔍</div>
            <h3 className="font-semibold text-[#0F172A] dark:text-slate-300">
              Start Searching
            </h3>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              Enter keywords above to query tasks across all board workflows.
            </p>
          </div>
        ) : matchedTasks.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2" id="search-empty-state">
            <div className="text-4xl font-semibold">🫙</div>
            <h3 className="font-semibold text-[#0F172A] dark:text-slate-300">
              No matching results
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              We couldn't find anything matching "{searchQuery}" inside TaskFlow tasks or collaborator profiles.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-[#64748B] font-bold pb-2 border-b border-slate-100 dark:border-slate-700">
              Found {matchedTasks.length} matching tasks
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60" id="search-results-list">
              {matchedTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const taskAssignees = (task.assigneeIds && task.assigneeIds.length > 0)
                  ? users.filter((u) => task.assigneeIds.includes(u.id))
                  : (task.assigneeId ? users.filter((u) => u.id === task.assigneeId) : []);
                
                return (
                  <div
                    key={task.id}
                    onClick={() => onOpenTaskDetail(task.id)}
                    className="group py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-slate-900/30 px-3 rounded transition-colors cursor-pointer"
                    id={`search-task-item-${task.id}`}
                  >
                    {/* Left content: Title & Project details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded ${getStatusBadgeClass(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        {project && (
                          <div className="flex items-center gap-1 text-[10px] text-[#64748B] font-semibold font-mono">
                            <Folder className="w-3 h-3" style={{ color: project.color }} />
                            <span>{project.name}</span>
                          </div>
                        )}
                        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600">ID: {task.id}</span>
                      </div>
                      
                      <h3 className="font-semibold text-sm text-[#0F172A] dark:text-slate-200 group-hover:text-[#2563EB] transition-colors">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-[#64748B] dark:text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Right content: Assignee, Priority & Deadline */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-0 md:pl-4">
                      {/* Assignees Stack */}
                      <div className="flex items-center gap-1.5">
                        {taskAssignees.length > 0 ? (
                          <>
                            <div className="flex -space-x-1.2 overflow-hidden shrink-0">
                              {taskAssignees.slice(0, 3).map((u) => (
                                <div
                                  key={u.id}
                                  className="w-5.5 h-5.5 rounded-full border border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                                  style={{ backgroundColor: u.avatarColor }}
                                  title={`${u.name} (${u.role})`}
                                >
                                  {u.initials}
                                </div>
                              ))}
                              {taskAssignees.length > 3 && (
                                <div className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-white dark:border-slate-800 flex items-center justify-center text-[7px] font-bold text-[#64748B] dark:text-slate-300 shrink-0">
                                  +{taskAssignees.length - 3}
                                </div>
                              )}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium hidden sm:inline max-w-[100px] truncate" title={taskAssignees.map(u => u.name).join(', ')}>
                              {taskAssignees.map(u => u.name).join(', ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[#64748B] italic">Unassigned</span>
                        )}
                      </div>

                      {/* Priority */}
                      <span className={`text-[9px] px-2.5 py-0.5 rounded uppercase font-bold tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Deadline */}
                      {task.deadline && (
                        <div className="text-[10px] font-mono text-[#64748B] dark:text-slate-400 bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 px-2 py-0.5 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#64748B]" />
                          <span>{task.deadline}</span>
                        </div>
                      )}

                      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 group-hover:text-[#2563EB] transition-all hidden md:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
