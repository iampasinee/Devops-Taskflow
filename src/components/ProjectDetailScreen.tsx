import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Columns, List, Search, Filter, Plus, Calendar, 
  MessageSquare, User as UserIcon, AlertCircle, ArrowUpDown, 
  Grid, Kanban, RefreshCw, X, SlidersHorizontal, CheckSquare, Settings
} from 'lucide-react';
import { Project, Task, User, Status, Priority } from '../types';

interface ProjectDetailScreenProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onOpenTaskDetail: (taskId: string) => void;
  onOpenAddTask: (projectId: string, defaultStatus: Status) => void;
  onUpdateTaskStatus: (taskId: string, status: Status) => void;
  onUpdateTaskPriority: (taskId: string, priority: Priority) => void;
  onUpdateTaskAssignee: (taskId: string, assigneeId: string) => void;
  onOpenEditProject: (projectId: string) => void;
}

const COLUMNS: { id: Status; label: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-[#F8FAFC] dark:bg-slate-900/45', dot: 'bg-slate-400' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-[#EFF6FF] dark:bg-blue-900/10', dot: 'bg-[#2563EB]' },
  { id: 'in_review', label: 'In Review', bg: 'bg-amber-50/30 dark:bg-amber-900/10', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', bg: 'bg-green-50/20 dark:bg-green-900/10', dot: 'bg-green-500' },
];

export default function ProjectDetailScreen({
  project,
  tasks,
  users,
  onOpenTaskDetail,
  onOpenAddTask,
  onUpdateTaskStatus,
  onUpdateTaskPriority,
  onUpdateTaskAssignee,
  onOpenEditProject,
}: ProjectDetailScreenProps) {
  // Navigation View Option
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  
  // Toolbar state: Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Drag and Drop active status
  const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

  // List View Sorting and Grouping
  const [sortField, setSortField] = useState<string>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groupByStatus, setGroupByStatus] = useState(false);

  // Filter tasks specific to this project
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // Apply search & filters
  const filteredTasks = projectTasks.filter((task) => {
    // Search query match (Title or Description)
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Assignee match
    const matchesAssignee = filterAssignee === '' || (task.assigneeIds && task.assigneeIds.includes(filterAssignee)) || task.assigneeId === filterAssignee;

    // Priority match
    const matchesPriority = filterPriority === '' || task.priority === filterPriority;

    return matchesSearch && matchesAssignee && matchesPriority;
  });

  // Today marker (2026-07-01)
  const TODAY_STR = '2026-07-01';

  // HTML5 Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, colId: Status) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, colId);
    }
  };

  // List view sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sorting logic helper
  const getSortedTasks = (items: typeof filteredTasks) => {
    return [...items].sort((a, b) => {
      let valA: any = a[sortField as keyof typeof a] || '';
      let valB: any = b[sortField as keyof typeof b] || '';

      if (sortField === 'assignee') {
        const firstAssigneeA = a.assigneeIds && a.assigneeIds.length > 0 ? a.assigneeIds[0] : a.assigneeId;
        const firstAssigneeB = b.assigneeIds && b.assigneeIds.length > 0 ? b.assigneeIds[0] : b.assigneeId;
        const uA = users.find((u) => u.id === firstAssigneeA)?.name || '';
        const uB = users.find((u) => u.id === firstAssigneeB)?.name || '';
        valA = uA;
        valB = uB;
      } else if (sortField === 'comments') {
        valA = a.commentCount;
        valB = b.commentCount;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedTasks = getSortedTasks(filteredTasks);

  // Helpers for Priority and Deadline Badge Style
  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'urgent': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'low': return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getDeadlineStyles = (deadline: string, status: Status) => {
    if (status === 'done') return 'bg-slate-100 text-slate-400 dark:bg-slate-850 dark:text-slate-500';
    if (!deadline) return 'bg-slate-50 text-slate-400 dark:bg-slate-850 dark:text-slate-500';
    if (deadline < TODAY_STR) return 'bg-red-50 text-red-600 border border-red-100 font-semibold';
    if (deadline === TODAY_STR) return 'bg-amber-50 text-amber-600 border border-amber-100 font-semibold';
    return 'bg-slate-100 text-slate-600 border border-slate-150';
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterAssignee('');
    setFilterPriority('');
  };

  const isFiltered = searchQuery !== '' || filterAssignee !== '' || filterPriority !== '';

  return (
    <div className="space-y-6" id="project-detail-root">
      
      {/* Project Header Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: project.color || '#2563EB' }}
              />
              <span className="font-mono text-xs text-[#64748B] uppercase tracking-wider">
                Active Workspace
              </span>
            </div>
            <div className="flex items-center gap-2.5 max-w-full">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white truncate">
                {project.name}
              </h1>
              <button
                onClick={() => onOpenEditProject(project.id)}
                className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-md transition-colors cursor-pointer shrink-0"
                id="btn-edit-project-settings"
                title="Edit Project"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-2xl leading-relaxed mt-1">
              {project.description || 'No description set.'}
            </p>
          </div>

          {/* View Mode Toggle Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-md border border-[#E2E8F0] dark:border-slate-800 w-fit shrink-0">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-[#EFF6FF] dark:bg-slate-800 text-[#2563EB] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
              id="btn-project-view-board"
            >
              <Kanban className="w-3.5 h-3.5" />
              Board View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#EFF6FF] dark:bg-slate-800 text-[#2563EB] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
              id="btn-project-view-list"
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
          </div>
        </div>

        {/* Member list line */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex -space-x-1.5">
            {project.memberIds.map((mid) => {
              const u = users.find((user) => user.id === mid);
              if (!u) return null;
              return (
                <div
                  key={u.id}
                  className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 cursor-help"
                  style={{ backgroundColor: u.avatarColor }}
                  title={`${u.name} (${u.role})`}
                >
                  {u.initials}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-[#64748B] font-semibold">
            {project.memberIds.length} collaborators working on {projectTasks.length} total tasks
          </span>
        </div>
      </div>

      {/* TOOLBAR: filters, search, and Add Button */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4" id="project-toolbar">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs border border-[#E2E8F0] dark:border-slate-700 rounded-md bg-[#F8FAFC] dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#283657] placeholder-[#64748B]"
              placeholder="Search project tasks..."
              id="input-project-search"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B] dark:text-slate-400" />
          </div>

          {/* Quick Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Assignee */}
            <div className="flex items-center gap-1.5 text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-md px-2.5 py-1 text-[#64748B]">
              <UserIcon className="w-3.5 h-3.5" />
              <select
                value={filterAssignee}
                onChange={(e) => setFilterAssignee(e.target.value)}
                className="bg-transparent border-0 text-[11px] font-medium text-[#64748B] dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
                id="select-filter-assignee"
              >
                <option value="">All Assignees</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Priority */}
            <div className="flex items-center gap-1.5 text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-md px-2.5 py-1 text-[#64748B]">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent border-0 text-[11px] font-medium text-[#64748B] dark:text-slate-300 focus:outline-none focus:ring-0 cursor-pointer"
                id="select-filter-priority"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Clear Filters indicator */}
            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#2563EB] hover:text-blue-700 font-bold flex items-center gap-0.5 px-2 cursor-pointer"
                id="btn-clear-filters"
              >
                Clear
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => onOpenAddTask(project.id, 'todo')}
          className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start lg:self-auto"
          id="btn-add-task-toolbar"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* FILTER ACTIVE COUNT INDICATOR */}
      {isFiltered && (
        <div className="text-xs text-slate-400 font-semibold px-1 flex items-center justify-between" id="filter-status-row">
          <span>Found {filteredTasks.length} matching tasks out of {projectTasks.length}</span>
          <button onClick={clearAllFilters} className="text-slate-500 hover:text-slate-800 underline">Show all tasks</button>
        </div>
      )}

      {/* VIEW S4: BOARD (KANBAN) VIEW */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="kanban-board-container">
          {COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            const isTarget = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`rounded-lg p-4 flex flex-col max-h-[75vh] min-h-[400px] border transition-all ${col.bg} ${
                  isTarget 
                    ? 'border-[#2563EB] ring-2 ring-blue-500/10 bg-blue-50/10' 
                    : 'border-[#E2E8F0] dark:border-slate-800/80'
                }`}
                id={`kanban-column-${col.id}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-200">
                      {col.label}
                    </h3>
                    <span className="bg-slate-200/65 dark:bg-slate-800 text-[#64748B] dark:text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenAddTask(project.id, col.id)}
                    className="p-1 text-slate-400 hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                    title={`Add task to ${col.label}`}
                    id={`btn-column-add-${col.id}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Column task cards stack */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="border border-dashed border-[#E2E8F0] dark:border-slate-800 rounded-lg p-6 text-center text-xs text-[#64748B] dark:text-slate-500 h-24 flex items-center justify-center">
                      No tasks here yet
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const taskAssignees = (task.assigneeIds && task.assigneeIds.length > 0)
                        ? users.filter((u) => task.assigneeIds.includes(u.id))
                        : (task.assigneeId ? users.filter((u) => u.id === task.assigneeId) : []);
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onOpenTaskDetail(task.id)}
                          className="bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700/60 p-4 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 cursor-grab active:cursor-grabbing transition-all space-y-3 group/card relative"
                          id={`kanban-card-${task.id}`}
                        >
                          {/* Card Priority Tag & Quick actions dropdown */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>

                            {/* Touch fallback: Status Selector */}
                            <select
                              value={task.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                onUpdateTaskStatus(task.id, e.target.value as Status);
                              }}
                              onClick={(e) => e.stopPropagation()} // don't open modal
                              className="text-[10px] bg-slate-50 dark:bg-slate-900 border-0 focus:ring-0 text-[#64748B] hover:text-[#0F172A] font-medium py-0.5 px-1 rounded-md cursor-pointer block md:hidden"
                              title="Move Task"
                              id={`select-touch-move-${task.id}`}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </div>

                          {/* Card Title */}
                          <h4 className="font-semibold text-sm text-[#0F172A] dark:text-slate-100 leading-snug group-hover/card:text-[#2563EB] dark:group-hover/card:text-blue-400 transition-colors whitespace-normal">
                            {task.title}
                          </h4>

                          {/* Card Footer Indicators */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/40">
                            {/* Deadline badge */}
                            {task.deadline ? (
                              <div className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono ${getDeadlineStyles(task.deadline, task.status)}`}>
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>{task.deadline === TODAY_STR ? 'Today' : task.deadline}</span>
                              </div>
                            ) : (
                              <div className="w-1" />
                            )}

                            {/* Assignee Avatar & comment counter */}
                            <div className="flex items-center gap-2 shrink-0">
                              {task.commentCount > 0 && (
                                <div className="flex items-center gap-0.5 text-[#64748B] text-[10px] font-mono">
                                  <MessageSquare className="w-3 h-3" />
                                  <span>{task.commentCount}</span>
                                </div>
                              )}

                              {taskAssignees.length > 0 ? (
                                <div className="flex -space-x-1.5 overflow-hidden">
                                  {taskAssignees.slice(0, 3).map((u) => (
                                    <div
                                      key={u.id}
                                      className="w-6 h-6 rounded-full border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-white cursor-help shadow-xs shrink-0"
                                      style={{ backgroundColor: u.avatarColor }}
                                      title={`${u.name} (${u.role})`}
                                    >
                                      {u.initials}
                                    </div>
                                  ))}
                                  {taskAssignees.length > 3 && (
                                    <div 
                                      className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-[#64748B] dark:text-slate-300 shadow-xs shrink-0"
                                      title={`${taskAssignees.length - 3} more assignees`}
                                    >
                                      +{taskAssignees.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div 
                                  className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border border-dashed border-[#E2E8F0] dark:border-slate-600 flex items-center justify-center text-slate-400"
                                  title="Unassigned"
                                >
                                  <UserIcon className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW S5: LIST VIEW (TABLE) */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-[#E2E8F0] dark:border-slate-700 p-5 shadow-sm overflow-hidden" id="list-view-container">
          
          {/* Options Header: Grouping and Sort Direction */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0] dark:border-slate-700">
            <h3 className="font-semibold text-sm text-[#0F172A] dark:text-slate-200">
              Workspace Registry ({sortedTasks.length} items)
            </h3>

            {/* List preferences buttons */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupByStatus}
                  onChange={(e) => setGroupByStatus(e.target.checked)}
                  className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB] cursor-pointer"
                  id="chk-group-by-status"
                />
                Group by status
              </label>
            </div>
          </div>

          {sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No tasks match your active filter settings. Clear them to see all.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              
              {/* Conditional Grouped Layout */}
              {groupByStatus ? (
                <div className="space-y-6">
                  {COLUMNS.map((col) => {
                    const colTasks = sortedTasks.filter((t) => t.status === col.id);
                    if (colTasks.length === 0) return null;
                    return (
                      <div key={col.id} className="space-y-2">
                        {/* Column Header subtitle */}
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg">
                          <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                          <span className="font-display font-semibold text-xs text-slate-700 dark:text-slate-200">
                            {col.label} ({colTasks.length})
                          </span>
                        </div>

                        {/* List items subset */}
                        <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400 table-fixed">
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {colTasks.map((task) => {
                              const taskAssignees = (task.assigneeIds && task.assigneeIds.length > 0)
                                ? users.filter((u) => task.assigneeIds.includes(u.id))
                                : (task.assigneeId ? users.filter((u) => u.id === task.assigneeId) : []);
                              return (
                                <tr 
                                  key={task.id} 
                                  onClick={() => onOpenTaskDetail(task.id)}
                                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25 cursor-pointer transition-colors"
                                  id={`table-row-${task.id}`}
                                >
                                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 truncate w-1/2">
                                    {task.title}
                                  </td>
                                  <td className="py-2.5 px-3 w-1/6">
                                    <div className="flex items-center gap-1.5">
                                      {taskAssignees.length > 0 ? (
                                        <div className="flex -space-x-1 overflow-hidden shrink-0">
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
                                      ) : (
                                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 w-1/12" onClick={(e) => e.stopPropagation()}>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityBadgeClass(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 w-1/12 font-mono" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="date"
                                      value={task.deadline}
                                      onChange={(e) => onOpenTaskDetail(task.id)} // date update handled in modal
                                      className="bg-transparent border-0 text-xs py-0 w-28 cursor-pointer text-slate-600 dark:text-slate-300"
                                      disabled
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 w-1/12 text-center font-mono text-slate-400">
                                    {task.commentCount > 0 ? (
                                      <span className="flex items-center gap-1 justify-center">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {task.commentCount}
                                      </span>
                                    ) : '-'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat Standard Table */
                <table className="w-full text-left text-xs text-slate-500 dark:text-slate-400" id="project-tasks-table">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-semibold bg-slate-50/50 dark:bg-slate-900/30">
                      <th className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('title')}>
                        <span className="flex items-center gap-1">
                          Task <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('assignee')}>
                        <span className="flex items-center gap-1">
                          Assignee <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('priority')}>
                        <span className="flex items-center gap-1">
                          Priority <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('status')}>
                        <span className="flex items-center gap-1">
                          Status <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('deadline')}>
                        <span className="flex items-center gap-1">
                          Deadline <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                      <th className="py-2.5 px-3 text-center cursor-pointer hover:text-slate-800 dark:hover:text-slate-200" onClick={() => handleSort('comments')}>
                        <span className="flex items-center gap-1 justify-center">
                          Comments <ArrowUpDown className="w-3 h-3" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {sortedTasks.map((task) => {
                      const taskAssignees = (task.assigneeIds && task.assigneeIds.length > 0)
                        ? users.filter((u) => task.assigneeIds.includes(u.id))
                        : (task.assigneeId ? users.filter((u) => u.id === task.assigneeId) : []);
                      return (
                        <tr 
                          key={task.id} 
                          onClick={() => onOpenTaskDetail(task.id)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-900/25 cursor-pointer transition-colors"
                          id={`table-row-${task.id}`}
                        >
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            <span className="block max-w-xs md:max-w-md truncate">{task.title}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-2">
                              {taskAssignees.length > 0 ? (
                                <>
                                  <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                                    {taskAssignees.slice(0, 3).map((u) => (
                                      <div
                                        key={u.id}
                                        className="w-5.5 h-5.5 rounded-full border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                                        style={{ backgroundColor: u.avatarColor }}
                                        title={`${u.name} (${u.role})`}
                                      >
                                        {u.initials}
                                      </div>
                                    ))}
                                    {taskAssignees.length > 3 && (
                                      <div 
                                        className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-700 border border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-[#64748B] dark:text-slate-300 shrink-0"
                                        title={`${taskAssignees.length - 3} more assignees`}
                                      >
                                        +{taskAssignees.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <span className="truncate max-w-[120px]" title={taskAssignees.map(u => u.name).join(', ')}>
                                    {taskAssignees.map(u => u.name).join(', ')}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase ${getPriorityBadgeClass(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={task.status}
                              onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as Status)}
                              className="bg-transparent border-0 text-xs text-slate-600 dark:text-slate-300 focus:outline-hidden py-0 cursor-pointer"
                              id={`select-inline-status-${task.id}`}
                            >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="in_review">In Review</option>
                              <option value="done">Done</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] ${getDeadlineStyles(task.deadline, task.status)}`}>
                              {task.deadline ? (task.deadline === TODAY_STR ? 'Today' : task.deadline) : 'No Date'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-400">
                            {task.commentCount > 0 ? (
                              <span className="flex items-center gap-1 justify-center">
                                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                                {task.commentCount}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
