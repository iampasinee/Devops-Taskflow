import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, User as UserIcon, AlertCircle, Plus } from 'lucide-react';
import { User, Priority, Status, Project, Task } from '../types';
import MultiAssigneeSelector from './MultiAssigneeSelector';

interface CreateTaskModalProps {
  projects: Project[];
  users: User[];
  defaultProjectId?: string;
  defaultStatus?: Status;
  onClose: () => void;
  onCreateTask: (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt'>) => void;
}

export default function CreateTaskModal({
  projects,
  users,
  defaultProjectId = '',
  defaultStatus = 'todo',
  onClose,
  onCreateTask,
}: CreateTaskModalProps) {
  const [projectId, setProjectId] = useState(defaultProjectId || (projects[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [deadline, setDeadline] = useState('');

  const [titleError, setTitleError] = useState('');
  const [isPastDeadlineWarning, setIsPastDeadlineWarning] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Update past deadline warning
  useEffect(() => {
    if (deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(deadline);
      setIsPastDeadlineWarning(deadlineDate < today && status !== 'done');
    } else {
      setIsPastDeadlineWarning(false);
    }
  }, [deadline, status]);

  // Trap escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Task title is required.');
      return;
    }
    if (title.length > 120) {
      setTitleError('Keep it under 120 characters.');
      return;
    }

    onCreateTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      assigneeId: assigneeIds[0] || '',
      assigneeIds,
      priority,
      status,
      deadline,
      order: 1, // Will append to columns appropriately
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
      onClick={onClose}
      id="create-task-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E2E8F0] dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        id="create-task-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800/50">
          <h2 className="font-bold text-base text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#2563EB]" />
            <span>Create New Task</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            id="btn-close-create-task"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          
          {/* Project Selection */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white"
              id="select-create-task-project"
              required
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Task Title *
            </label>
            <input
              type="text"
              ref={titleInputRef}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              className={`w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border ${
                titleError ? 'border-red-500' : 'border-[#E2E8F0] dark:border-slate-700'
              } rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 ${
                titleError ? 'focus:ring-red-500' : 'focus:ring-[#283657]'
              } focus:bg-[#283657] focus:text-white`}
              placeholder="e.g. Build API Endpoint"
              id="input-create-task-title"
              required
            />
            {titleError && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1" id="create-task-title-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {titleError}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white"
              placeholder="Describe the task objective..."
              id="textarea-create-task-description"
            />
          </div>

          {/* Two column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Assignees
              </label>
              <MultiAssigneeSelector
                users={users}
                selectedIds={assigneeIds}
                onChange={setAssigneeIds}
                id="select-create-task-assignee-multi"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white"
                id="select-create-task-status"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Two column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white"
                id="select-create-task-priority"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Deadline */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white animate-none"
                id="input-create-task-deadline"
              />
              {isPastDeadlineWarning && (
                <div className="flex items-start gap-1 text-amber-600 dark:text-amber-500 text-[10px] font-medium leading-tight mt-1 bg-amber-50/50 dark:bg-amber-950/20 p-1.5 rounded-md">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>That date is in the past — is that intended?</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/20 -mx-6 -mb-6 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              id="btn-cancel-create-task"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              id="btn-confirm-create-task"
            >
              Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
