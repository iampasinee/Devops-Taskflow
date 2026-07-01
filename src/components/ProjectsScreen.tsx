import React from 'react';
import { motion } from 'motion/react';
import { FolderPlus, Calendar, Layers, ChevronRight, Users } from 'lucide-react';
import { Project, Task, User } from '../types';

interface ProjectsScreenProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onSelectProject: (projectId: string) => void;
  onOpenCreateProject: () => void;
}

export default function ProjectsScreen({
  projects,
  tasks,
  users,
  onSelectProject,
  onOpenCreateProject,
}: ProjectsScreenProps) {

  const getProjectStats = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projTasks.length;
    const completed = projTasks.filter((t) => t.status === 'done').length;
    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, progressPercent };
  };

  return (
    <div className="space-y-6" id="projects-screen-root">
      {/* Header with Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-white">
            Projects Portfolio
          </h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
            Browse and organize active collaborative project workspaces.
          </p>
        </div>

        {/* CTA: Create project */}
        <button
          onClick={onOpenCreateProject}
          className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          id="btn-trigger-create-project"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid of Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="projects-grid">
        {projects.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 rounded-lg p-12 text-center space-y-4 shadow-sm">
            <div className="text-4xl">📁</div>
            <h3 className="font-semibold text-lg text-[#0F172A] dark:text-slate-200">
              No Projects Found
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Get started by creating your very first project workspace and assigning tasks.
            </p>
            <button
              onClick={onOpenCreateProject}
              className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              id="btn-empty-create-project"
            >
              Add Project
            </button>
          </div>
        ) : (
          projects.map((proj) => {
            const { total, completed, progressPercent } = getProjectStats(proj.id);
            return (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectProject(proj.id)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-[#E2E8F0] dark:border-slate-700 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 p-5 space-y-4 cursor-pointer transition-all flex flex-col justify-between group"
                id={`project-card-${proj.id}`}
              >
                <div className="space-y-2">
                  {/* Color Accent Bar & Meta */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="h-2 w-10 rounded-full" 
                      style={{ backgroundColor: proj.color || '#2563EB' }}
                    />
                    <span className="text-[10px] text-[#64748B] font-mono">
                      ID: {proj.id}
                    </span>
                  </div>

                  {/* Project Name & Description */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#0F172A] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors flex items-center justify-between gap-2">
                      <span className="truncate">{proj.name}</span>
                      <ChevronRight className="w-4 h-4 text-[#64748B] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-2 h-8">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  {/* Progress indicators */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#64748B]">Completion</span>
                      <span className="text-[#0F172A] dark:text-slate-200">
                        {completed} / {total} done <span className="text-[#64748B] font-normal">({progressPercent}%)</span>
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-md h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-md transition-all duration-300"
                        style={{ 
                          width: `${progressPercent}%`, 
                          backgroundColor: proj.color || '#2563EB' 
                        }}
                      />
                    </div>
                  </div>

                  {/* Avatars Stack & Icons */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Collapsed Member Avatars */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {proj.memberIds.map((memberId) => {
                        const m = users.find((u) => u.id === memberId);
                        if (!m) return null;
                        return (
                          <div
                            key={m.id}
                            className="w-6.5 h-6.5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[9px] font-bold text-white cursor-help shrink-0"
                            style={{ backgroundColor: m.avatarColor }}
                            title={`${m.name} (${m.role})`}
                          >
                            {m.initials}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#64748B] font-mono">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{total} Tasks</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
