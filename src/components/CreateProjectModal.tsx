import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, Palette, Users } from 'lucide-react';
import { User, Project } from '../types';
import MultiAssigneeSelector from './MultiAssigneeSelector';

interface CreateProjectModalProps {
  existingProjects: Project[];
  users: User[];
  onClose: () => void;
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt'>) => void;
}

const ACCENT_COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#F59E0B', // Amber
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
];

export default function CreateProjectModal({
  existingProjects,
  users,
  onClose,
  onCreateProject,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(ACCENT_COLORS[0]);
  const [memberIds, setMemberIds] = useState<string[]>(['u1']); // pre-populate with Alex Rivera (current user)

  const [nameError, setNameError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input on mount
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

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

    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    if (name.length > 60) {
      setNameError('Keep it under 60 characters.');
      return;
    }

    const isDuplicate = existingProjects.some(
      (p) => p.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setNameError('A project with this name already exists.');
      return;
    }

    setNameError('');
    onCreateProject({
      name: name.trim(),
      description: description.trim(),
      color,
      memberIds,
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs"
      onClick={onClose}
      id="create-project-backdrop"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-[#E2E8F0] dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
        id="create-project-modal-container"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800/50">
          <h2 className="font-bold text-base text-[#0F172A] dark:text-slate-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#2563EB]" />
            <span>Create New Project</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
            id="btn-close-create-project"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          
          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Project Name *
            </label>
            <input
              type="text"
              ref={nameInputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError('');
              }}
              className={`w-full text-xs bg-[#F8FAFC] dark:bg-slate-900 border ${
                nameError ? 'border-red-500' : 'border-[#E2E8F0] dark:border-slate-700'
              } rounded-md p-2.5 text-[#0F172A] dark:text-slate-200 focus:outline-none focus:ring-1 ${
                nameError ? 'focus:ring-red-500' : 'focus:ring-[#283657]'
              } focus:bg-[#283657] focus:text-white`}
              placeholder="e.g. Android Mobile App v3"
              id="input-create-project-name"
              required
            />
            {nameError && (
              <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1" id="create-project-name-error">
                <AlertCircle className="w-3.5 h-3.5" />
                {nameError}
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
              placeholder="What is this project's scope/objective?"
              id="textarea-create-project-description"
            />
          </div>

          {/* Accent Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider block">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5" id="project-color-picker">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                    color === c ? 'scale-110 shadow-sm ring-2 ring-offset-2 ring-[#2563EB]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                  id={`btn-project-color-${c.replace('#', '')}`}
                >
                  {color === c && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Project Members Selection (Dropdown with Search) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-4 h-4 text-[#64748B]" />
              Team Members
            </label>
            <MultiAssigneeSelector
              users={users}
              selectedIds={memberIds}
              onChange={setMemberIds}
              placeholder="Select team members..."
              id="project-member-picker"
            />
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/20 -mx-6 -mb-6 p-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              id="btn-cancel-create-project"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-[#2563EB] hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
              id="btn-confirm-create-project"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
