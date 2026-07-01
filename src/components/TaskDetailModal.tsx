import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, User as UserIcon, AlertCircle, ArrowUpRight, 
  Trash2, MessageSquare, Plus, Clock, FolderOpen
} from 'lucide-react';
import { Task, User, Comment, Priority, Status, Project } from '../types';
import MultiAssigneeSelector from './MultiAssigneeSelector';

interface TaskDetailModalProps {
  task: Task;
  users: User[];
  comments: Comment[];
  projects: Project[];
  currentUser: User;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddComment: (taskId: string, body: string) => void;
}

export default function TaskDetailModal({
  task,
  users,
  comments,
  projects,
  currentUser,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []));
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [status, setStatus] = useState<Status>(task.status);
  const [deadline, setDeadline] = useState(task.deadline);
  const [newComment, setNewComment] = useState('');
  
  const [titleError, setTitleError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isPastDeadlineWarning, setIsPastDeadlineWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync state if task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setAssigneeId(task.assigneeId || '');
    setAssigneeIds(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []));
    setPriority(task.priority);
    setStatus(task.status);
    setDeadline(task.deadline);
  }, [task]);

  // Handle past deadline warning
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
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleTitleBlur = () => {
    if (!title.trim()) {
      setTitleError('Task title is required.');
      return;
    }
    if (title.length > 120) {
      setTitleError('Keep it under 120 characters.');
      return;
    }
    setTitleError('');
    onUpdateTask({ ...task, title: title.trim() });
  };

  const handleDescriptionBlur = () => {
    onUpdateTask({ ...task, description });
  };

  const handleStatusChange = (newStatus: Status) => {
    setStatus(newStatus);
    onUpdateTask({ ...task, status: newStatus });
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId);
    const updatedIds = newAssigneeId ? [newAssigneeId] : [];
    setAssigneeIds(updatedIds);
    onUpdateTask({ ...task, assigneeId: newAssigneeId, assigneeIds: updatedIds });
  };

  const handleAssigneeIdsChange = (newAssigneeIds: string[]) => {
    setAssigneeIds(newAssigneeIds);
    const mainAssignee = newAssigneeIds[0] || '';
    setAssigneeId(mainAssignee);
    onUpdateTask({ ...task, assigneeId: mainAssignee, assigneeIds: newAssigneeIds });
  };

  const handlePriorityChange = (newPriority: Priority) => {
    setPriority(newPriority);
    onUpdateTask({ ...task, priority: newPriority });
  };

  const handleDeadlineChange = (newDeadline: string) => {
    setDeadline(newDeadline);
    onUpdateTask({ ...task, deadline: newDeadline });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError("Comment can't be empty.");
      return;
    }
    if (newComment.length > 2000) {
      setCommentError("Comment is too long (max 2000 chars).");
      return;
    }
    
    setCommentError('');
    onAddComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    onClose();
  };

  const projectOfTask = projects.find(p => p.id === task.projectId);
  const taskComments = comments.filter(c => c.taskId === task.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Priority styling tokens
  const priorityBadgeStyles = {
    low: 'bg-slate-100 text-slate-800 border-slate-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    high: 'bg-amber-50 text-amber-700 border-amber-200',
    urgent: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
      onClick={onClose}
      id="task-detail-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full max-w-3xl bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E2E8F0] dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        id="task-detail-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span 
              className="w-3.5 h-3.5 rounded-full" 
              style={{ backgroundColor: projectOfTask?.color || '#2563EB' }}
            />
            <span className="font-bold text-xs tracking-wider text-[#64748B] dark:text-slate-400 uppercase">
              {projectOfTask?.name || 'No Project'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="font-mono text-xs text-[#64748B]">
              ID: {task.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="p-1.5 text-[#64748B] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all cursor-pointer"
              title="Delete task"
              id="btn-delete-task-trigger"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer"
              id="btn-close-task-detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Overlay inside modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-950/20 px-6 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between gap-4 overflow-hidden"
              id="delete-confirm-bar"
            >
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Are you sure you want to delete this task? This cannot be undone.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded"
                  id="btn-cancel-delete-task"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-[11px] font-medium bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  id="btn-confirm-delete-task"
                >
                  Delete Task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Body Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Title input */}
          <div className="space-y-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className={`w-full font-bold text-xl md:text-2xl bg-transparent border-b border-transparent hover:border-slate-150 focus:border-[#283657] focus:outline-none py-1 px-1 transition-all text-[#0F172A] dark:text-slate-100 rounded-sm`}
              placeholder="Task Title"
              id="input-task-title"
            />
            {titleError && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1" id="task-title-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {titleError}
              </p>
            )}
          </div>

          {/* Main layout: Attributes sidebar + Rich Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Description & Comments */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  rows={4}
                  className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-md p-3 text-[#0F172A] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white dark:focus:bg-[#283657] dark:focus:text-white transition-all custom-scrollbar resize-none"
                  placeholder="Provide a description of the task..."
                  id="textarea-task-description"
                />
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <h3 className="font-bold text-sm text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2563EB]" />
                  Activity & Discussion
                </h3>

                {/* Comment Thread */}
                <div className="space-y-3" id="comments-list-container">
                  {taskComments.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/40 rounded-md p-4 text-center text-[#64748B] dark:text-slate-400 text-xs">
                      No comments yet. Start the conversation below!
                    </div>
                  ) : (
                    taskComments.map((comment) => {
                      const author = users.find(u => u.id === comment.authorId);
                      return (
                        <div key={comment.id} className="flex gap-3 bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-md border border-slate-100/50 dark:border-slate-800/30">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: author?.avatarColor || '#94A3B8' }}
                          >
                            {author?.initials || '??'}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-baseline justify-between">
                              <span className="font-semibold text-xs text-[#0F172A] dark:text-slate-200">
                                {author?.name || 'Unknown User'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { 
                                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                              {comment.body}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Comment composer */}
                <form onSubmit={handleSubmitComment} className="space-y-2 mt-4" id="form-comment-composer">
                  <div className="flex gap-3 items-start">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: currentUser.avatarColor }}
                    >
                      {currentUser.initials}
                    </div>
                    <div className="flex-1 space-y-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => {
                          setNewComment(e.target.value);
                          if (commentError) setCommentError('');
                        }}
                        rows={2}
                        className="w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#283657] focus:bg-[#283657] focus:text-white dark:focus:bg-[#283657] dark:focus:text-white transition-all custom-scrollbar resize-none"
                        placeholder="Write a response..."
                        id="textarea-new-comment"
                      />
                      {commentError && (
                        <p className="text-red-500 text-xs font-medium flex items-center gap-1" id="comment-error-msg">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {commentError}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors cursor-pointer ${
                            newComment.trim() 
                              ? 'bg-[#2563EB] hover:bg-blue-700' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          }`}
                          id="btn-submit-comment"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Attributes metadata sidebar */}
            <div className="bg-[#F8FAFC] dark:bg-slate-900/50 rounded-md p-4 border border-[#E2E8F0] dark:border-slate-800 space-y-4 h-fit text-xs">
              <h4 className="text-xs font-bold text-[#64748B] dark:text-slate-500 uppercase tracking-wider">
                Attributes
              </h4>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as Status)}
                  className="w-full bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657]"
                  id="select-task-status-attribute"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Assignees Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <UserIcon className="w-3.5 h-3.5 text-[#64748B]" />
                  Assignees
                </label>
                <div className="relative">
                  <MultiAssigneeSelector
                    users={users}
                    selectedIds={assigneeIds}
                    onChange={handleAssigneeIdsChange}
                    id="select-task-assignees-multi-attribute"
                  />
                </div>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5 text-[#64748B]" />
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                  className="w-full bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657]"
                  id="select-task-priority-attribute"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Deadline Datepicker */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 text-xs rounded-md p-2 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#283657]"
                  id="input-task-deadline-attribute"
                />
                
                {isPastDeadlineWarning && (
                  <div className="flex items-start gap-1 text-red-600 dark:text-red-400 text-[10px] font-medium leading-tight mt-1 bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>That date is in the past — is that intended?</span>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1 text-[11px] text-slate-400 font-mono">
                <div>Created: {new Date(task.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
