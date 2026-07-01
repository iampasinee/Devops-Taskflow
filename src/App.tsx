import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, LayoutDashboard, FolderKanban, Users, Settings, 
  Search, Plus, LogOut, CheckCircle2, AlertCircle, X, Menu, Compass,
  ChevronLeft, ChevronRight
} from 'lucide-react';

import { User, Project, Task, Comment, Status, Priority } from './types';
import { 
  initialUsers, initialProjects, initialTasks, initialComments 
} from './data';

import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ProjectsScreen from './components/ProjectsScreen';
import ProjectDetailScreen from './components/ProjectDetailScreen';
import TeamScreen from './components/TeamScreen';
import SettingsScreen from './components/SettingsScreen';
import SearchScreen from './components/SearchScreen';
import TaskDetailModal from './components/TaskDetailModal';
import CreateTaskModal from './components/CreateTaskModal';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';

// Local storage Helper
const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

export default function App() {
  // Core Application Persistent State
  const [users, setUsers] = useState<User[]>(() => 
    getLocalStorage('tf_users', initialUsers)
  );
  const [projects, setProjects] = useState<Project[]>(() => 
    getLocalStorage('tf_projects', initialProjects)
  );
  const [tasks, setTasks] = useState<Task[]>(() => 
    getLocalStorage('tf_tasks', initialTasks)
  );
  const [comments, setComments] = useState<Comment[]>(() => 
    getLocalStorage('tf_comments', initialComments)
  );
  const [currentUser, setCurrentUser] = useState<User | null>(() => 
    getLocalStorage('tf_current_user', null)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => 
    getLocalStorage('tf_is_authenticated', false)
  );

  // Router State
  const [route, setRoute] = useState<{
    view: 'dashboard' | 'projects' | 'project' | 'team' | 'settings' | 'search';
    projectId: string | null;
    taskId: string | null;
  }>({ view: 'dashboard', projectId: null, taskId: null });

  // UI Component control states
  const [globalSearch, setGlobalSearch] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<Status>('todo');
  const [createTaskDefaultProjectId, setCreateTaskDefaultProjectId] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProjectId, setShowEditProjectId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    getLocalStorage('tf_sidebar_collapsed', false)
  );
  
  // Toast Notification state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  // Synchronizers: Save state to localStorage upon any mutation
  useEffect(() => {
    localStorage.setItem('tf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('tf_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tf_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tf_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('tf_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('tf_is_authenticated', JSON.stringify(isAuthenticated));
    localStorage.setItem('tf_current_user', JSON.stringify(currentUser));
  }, [isAuthenticated, currentUser]);

  // Hash Router Listener & Deep link parser
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/dashboard';
      const path = hash.replace('#', '').split('?')[0] || '/dashboard';
      const segments = path.split('/').filter(Boolean);

      // Handle explicit logout
      if (path === '/logout') {
        handleLogout();
        return;
      }

      if (path === '/login') {
        if (isAuthenticated) {
          window.location.hash = '#/dashboard';
        }
        return;
      }

      // Check Views
      if (path === '/projects') {
        setRoute({ view: 'projects', projectId: null, taskId: null });
      } else if (path === '/team') {
        setRoute({ view: 'team', projectId: null, taskId: null });
      } else if (path === '/settings') {
        setRoute({ view: 'settings', projectId: null, taskId: null });
      } else if (path === '/search') {
        setRoute({ view: 'search', projectId: null, taskId: null });
      } else if (path.startsWith('/project/')) {
        const projectId = segments[1] || null;
        let taskId = null;
        if (segments[2] === 'task' && segments[3]) {
          taskId = segments[3];
        }
        setRoute({ view: 'project', projectId, taskId });
      } else {
        setRoute({ view: 'dashboard', projectId: null, taskId: null });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize on load
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Toast manager
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    triggerToast(`Logged in successfully. Welcome back, ${user.name}!`, 'success');
    window.location.hash = '#/dashboard';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    window.location.hash = '#/login';
    triggerToast('Logged out of TaskFlow.', 'success');
  };

  // Task Mutations
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t${tasks.length + 10}`, // safe generated seed index
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowCreateTask(false);
    triggerToast('Task created successfully.', 'success');
    
    // Redirect to project detail view of task if not already there
    window.location.hash = `#/project/${taskData.projectId}`;
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    triggerToast('Task configurations updated.', 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setComments((prev) => prev.filter((c) => c.taskId !== taskId));
    
    // Update hash router to close modal safely
    if (route.projectId) {
      window.location.hash = `#/project/${route.projectId}`;
    } else {
      window.location.hash = `#/dashboard`;
    }
    triggerToast('Task deleted successfully.', 'success');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: Status) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    const updatedTask = tasks.find((t) => t.id === taskId);
    if (updatedTask) {
      triggerToast(`Task moved to ${newStatus.replace('_', ' ')}.`, 'success');
    }
  };

  const handleUpdateTaskPriority = (taskId: string, newPriority: Priority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
  };

  const handleUpdateTaskAssignee = (taskId: string, assigneeId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigneeId, assigneeIds: assigneeId ? [assigneeId] : [] } : t))
    );
    triggerToast('Task assignee changed.', 'success');
  };

  // Comment Mutations
  const handleAddComment = (taskId: string, body: string) => {
    if (!currentUser) return;
    const newCommentObj: Comment = {
      id: `c${comments.length + 10}`,
      taskId,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newCommentObj]);
    
    // Increment comments counter
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, commentCount: t.commentCount + 1 } : t
      )
    );
    triggerToast('Response posted.', 'success');
  };

  // Project Mutations
  const handleCreateProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProj: Project = {
      ...projectData,
      id: `p${projects.length + 1}`,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [...prev, newProj]);
    setShowCreateProject(false);
    triggerToast(`Project "${newProj.name}" created successfully.`, 'success');
    
    // Navigate straight to the new project's board view
    window.location.hash = `#/project/${newProj.id}`;
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setShowEditProjectId(null);
    triggerToast(`Project "${updatedProject.name}" updated successfully.`, 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
    setShowEditProjectId(null);
    triggerToast('Project and its tasks deleted successfully.', 'success');
    window.location.hash = '#/projects';
  };

  // Update profile
  const handleUpdateProfile = (updatedProfile: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedProfile };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
  };

  // Global search input handling
  const handleGlobalSearchChange = (query: string) => {
    setGlobalSearch(query);
    if (query.trim() && route.view !== 'search') {
      window.location.hash = '#/search';
    }
  };

  // Navigation Click triggers
  const handleNavigate = (hashPath: string) => {
    window.location.hash = hashPath;
    setMobileMenuOpen(false);
  };

  // Render modal trigger
  const handleOpenAddTask = (projectId: string = '', defaultStatus: Status = 'todo') => {
    setCreateTaskDefaultProjectId(projectId);
    setCreateTaskDefaultStatus(defaultStatus);
    setShowCreateTask(true);
  };

  // Active Task Detail selector for S6 Modal Deep Link Overlay
  const activeTask = tasks.find((t) => t.id === route.taskId);

  // Authentication check wrapper
  if (!isAuthenticated || !currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} users={users} />;
  }

  // Active screen renderer
  const renderActiveScreen = () => {
    switch (route.view) {
      case 'projects':
        return (
          <ProjectsScreen
            projects={projects}
            tasks={tasks}
            users={users}
            onSelectProject={(pid) => handleNavigate(`#/project/${pid}`)}
            onOpenCreateProject={() => setShowCreateProject(true)}
          />
        );
      case 'project':
        const activeProj = projects.find((p) => p.id === route.projectId);
        if (!activeProj) {
          return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-850">Project Not Found</h2>
              <p className="text-sm text-slate-400 mt-2">The project link might be broken or deleted.</p>
              <button
                onClick={() => handleNavigate('#/projects')}
                className="mt-4 px-4 py-2 bg-brand text-white font-medium text-xs rounded-lg"
              >
                Back to Projects
              </button>
            </div>
          );
        }
        return (
          <ProjectDetailScreen
            project={activeProj}
            tasks={tasks}
            users={users}
            onOpenTaskDetail={(tid) => handleNavigate(`#/project/${activeProj.id}/task/${tid}`)}
            onOpenAddTask={(pid, status) => handleOpenAddTask(pid, status)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTaskPriority={handleUpdateTaskPriority}
            onUpdateTaskAssignee={handleUpdateTaskAssignee}
            onOpenEditProject={(pid) => setShowEditProjectId(pid)}
          />
        );
      case 'team':
        return <TeamScreen users={users} tasks={tasks} />;
      case 'settings':
        return (
          <SettingsScreen
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
            onTriggerToast={triggerToast}
          />
        );
      case 'search':
        return (
          <SearchScreen
            tasks={tasks}
            projects={projects}
            users={users}
            searchQuery={globalSearch}
            onChangeSearchQuery={setGlobalSearch}
            onOpenTaskDetail={(tid) => {
              const task = tasks.find(t => t.id === tid);
              if (task) {
                handleNavigate(`#/project/${task.projectId}/task/${tid}`);
              }
            }}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            currentUser={currentUser}
            tasks={tasks}
            projects={projects}
            users={users}
            onOpenTask={(tid) => {
              const task = tasks.find(t => t.id === tid);
              if (task) {
                handleNavigate(`#/project/${task.projectId}/task/${tid}`);
              }
            }}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
    }
  };

  const navItems = [
    { label: 'My Work', icon: LayoutDashboard, path: '#/dashboard', activeView: 'dashboard' },
    { label: 'Projects', icon: FolderKanban, path: '#/projects', activeView: 'projects' },
    { label: 'Team', icon: Users, path: '#/team', activeView: 'team' },
    { label: 'Settings', icon: Settings, path: '#/settings', activeView: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex text-[#0F172A] dark:text-slate-100" id="taskflow-app-shell">
      
      {/* 1. SIDEBAR NAVIGATION: Desktop & Large tablet viewport (>= 768px) */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-slate-800 border-r border-[#E2E8F0] dark:border-slate-750 shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Brand header */}
        <div className={`p-4 flex transition-all duration-300 ${isSidebarCollapsed ? 'flex-col items-center gap-3 mb-4' : 'items-center justify-between p-6 mb-4'}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-xs shrink-0">
              <div className="w-4 h-4 bg-white rounded-xs"></div>
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white truncate">
                TaskFlow
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-md transition-all cursor-pointer shrink-0"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            id="btn-sidebar-collapse-toggle"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Links stack */}
        <nav className={`flex-1 px-3 space-y-1 ${isSidebarCollapsed ? 'flex flex-col items-center' : ''}`}>
          {navItems.map((item) => {
            const isActive = route.view === item.activeView || (item.activeView === 'projects' && route.view === 'project');
            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`flex items-center rounded-md text-sm transition-all cursor-pointer font-medium ${
                  isSidebarCollapsed 
                    ? 'w-10 h-10 justify-center' 
                    : 'w-full gap-3 px-3 py-2 text-left'
                } ${
                  isActive
                    ? 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 font-semibold'
                    : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-700/50 hover:text-[#0F172A] dark:hover:text-white'
                }`}
                id={`sidebar-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                title={item.label}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B]'}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User profile */}
        <div className={`p-4 border-t border-[#E2E8F0] dark:border-slate-750 transition-all duration-300 ${isSidebarCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3 w-full'} p-2`}>
            <div 
              onClick={() => handleNavigate('#/settings')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: currentUser.avatarColor }}
              title={`${currentUser.name} (${currentUser.email})`}
            >
              {currentUser.initials}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate text-[#0F172A] dark:text-white">{currentUser.name}</span>
                <span className="text-xs text-[#64748B] dark:text-slate-400 truncate">{currentUser.email}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              isSidebarCollapsed 
                ? 'w-10 h-10 p-0 justify-center' 
                : 'w-full mt-2 py-1.5 px-3 justify-center'
            } rounded-md text-xs font-medium border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] hover:text-red-600 hover:border-red-100 hover:bg-red-50/30 dark:hover:bg-red-950/20`}
            id="btn-sidebar-logout"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-[#E2E8F0] dark:border-slate-750 flex items-center justify-between px-8 shrink-0 z-10">
          
          {/* Mobile hamburger menu trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-500 hover:text-[#0F172A] hover:bg-slate-100 rounded-md md:hidden cursor-pointer"
              id="btn-mobile-menu-hamburger"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* View Breadcrumb / Status marker */}
            <div className="flex items-center text-sm text-[#64748B] dark:text-slate-400 hidden sm:flex">
              <span className="capitalize">{route.view === 'project' ? 'Projects' : route.view}</span>
              {route.view === 'project' && (
                <>
                  <span className="mx-2 text-[#64748B]/50">/</span>
                  <span className="text-[#0F172A] dark:text-white font-medium">
                    {projects.find(p => p.id === route.projectId)?.name || 'Detail'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick global search in Header */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => handleGlobalSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="w-64 pl-9 pr-4 py-1.5 text-sm border border-[#E2E8F0] dark:border-slate-700 rounded-md bg-[#F8FAFC] dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] placeholder-[#64748B]"
                id="input-header-global-search"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#64748B] dark:text-slate-400" />
            </div>

            <button
              onClick={() => handleOpenAddTask()}
              className="bg-[#2563EB] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              id="btn-header-fast-add"
            >
              + Add Task
            </button>

            <div 
              onClick={() => handleNavigate('#/settings')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-105 transition-transform shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
              title="Settings"
            >
              {currentUser.initials}
            </div>
          </div>
        </header>

        {/* Sliding drawer navigation menu on Mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
                className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 z-50 flex flex-col p-4 border-r border-[#E2E8F0] md:hidden"
              >
                {/* Mobile drawer header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#2563EB] flex items-center justify-center text-white">
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                    <span className="font-bold text-lg text-[#0F172A] dark:text-white">TaskFlow</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-slate-400 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile drawer nav items */}
                <nav className="flex-1 py-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = route.view === item.activeView || (item.activeView === 'projects' && route.view === 'project');
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          handleNavigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors cursor-pointer text-left ${
                          isActive ? 'bg-blue-50/50 text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400' : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile logout */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: currentUser.avatarColor }}>
                      {currentUser.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{currentUser.name}</div>
                      <div className="text-[10px] text-[#64748B]">{currentUser.role}</div>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full py-1.5 border border-[#E2E8F0] rounded text-xs font-bold text-[#64748B] hover:text-red-500 flex items-center justify-center gap-1.5 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Container hosting current screen */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            {renderActiveScreen()}
          </div>
        </main>

        {/* MOBILE VIEW NAVIGATION BAR: Bottom dock for small devices */}
        <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-800 border-t border-[#E2E8F0] dark:border-slate-750 h-16 flex md:hidden items-center justify-around px-2 z-20 shadow-sm">
          {navItems.map((item) => {
            const isActive = route.view === item.activeView || (item.activeView === 'projects' && route.view === 'project');
            return (
              <button
                key={item.label}
                onClick={() => handleNavigate(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded cursor-pointer ${
                  isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
                id={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-bold tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. TASK DETAIL MODAL OVERLAY (S6 - Modal/Deep Link) */}
      <AnimatePresence>
        {activeTask && (
          <TaskDetailModal
            task={activeTask}
            users={users}
            comments={comments}
            projects={projects}
            currentUser={currentUser}
            onClose={() => {
              // Reset path to project board when closing modal
              if (route.projectId) {
                handleNavigate(`#/project/${route.projectId}`);
              } else {
                handleNavigate('#/dashboard');
              }
            }}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddComment={handleAddComment}
          />
        )}
      </AnimatePresence>

      {/* 4. CREATE TASK MODAL OVERLAY (Flow A) */}
      <AnimatePresence>
        {showCreateTask && (
          <CreateTaskModal
            projects={projects}
            users={users}
            defaultProjectId={createTaskDefaultProjectId}
            defaultStatus={createTaskDefaultStatus}
            onClose={() => setShowCreateTask(false)}
            onCreateTask={handleCreateTask}
          />
        )}
      </AnimatePresence>

      {/* 5. CREATE PROJECT MODAL OVERLAY (Flow F) */}
      <AnimatePresence>
        {showCreateProject && (
          <CreateProjectModal
            existingProjects={projects}
            users={users}
            onClose={() => setShowCreateProject(false)}
            onCreateProject={handleCreateProject}
          />
        )}
      </AnimatePresence>

      {/* 5.1 EDIT PROJECT MODAL OVERLAY */}
      <AnimatePresence>
        {showEditProjectId && (() => {
          const projectToEdit = projects.find((p) => p.id === showEditProjectId);
          if (!projectToEdit) return null;
          return (
            <EditProjectModal
              project={projectToEdit}
              existingProjects={projects}
              users={users}
              onClose={() => setShowEditProjectId(null)}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
            />
          );
        })()}
      </AnimatePresence>

      {/* 6. SYSTEM TOAST SYSTEM */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none" id="toasts-portal">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-3.5 rounded border shadow-sm flex items-center gap-2.5 max-w-sm pointer-events-auto bg-white dark:bg-slate-800 ${
                toast.type === 'error' 
                  ? 'border-red-150 text-red-600 dark:border-red-950/40 dark:text-red-400' 
                  : 'border-green-150 text-green-600 dark:border-green-950/40 dark:text-green-400'
              }`}
              id={`toast-${toast.id}`}
            >
              {toast.type === 'error' ? (
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
