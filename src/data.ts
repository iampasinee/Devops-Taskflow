import { User, Project, Task, Comment } from './types';

export const initialUsers: User[] = [
  { id: "u1", name: "Alex Rivera",   email: "alex@taskflow.app",   role: "Product Manager", avatarColor: "#2563EB", initials: "AR" },
  { id: "u2", name: "Priya Nair",    email: "priya@taskflow.app",  role: "Designer",        avatarColor: "#16A34A", initials: "PN" },
  { id: "u3", name: "Marco Silva",   email: "marco@taskflow.app",  role: "Frontend Dev",    avatarColor: "#F59E0B", initials: "MS" },
  { id: "u4", name: "Dana Kim",      email: "dana@taskflow.app",   role: "QA Engineer",     avatarColor: "#DC2626", initials: "DK" },
  { id: "u5", name: "Sam Okafor",    email: "sam@taskflow.app",    role: "Backend Dev",     avatarColor: "#7C3AED", initials: "SO" }
];

export const initialProjects: Project[] = [
  {
    id: "p1",
    name: "Website Redesign",
    description: "Revamp the marketing site with a new design system.",
    color: "#2563EB",
    memberIds: ["u1", "u2", "u3"],
    createdAt: "2026-05-02T09:00:00Z"
  },
  {
    id: "p2",
    name: "Mobile App v2",
    description: "Ship the v2 release with offline support.",
    color: "#16A34A",
    memberIds: ["u1", "u3", "u4", "u5"],
    createdAt: "2026-05-10T14:30:00Z"
  },
  {
    id: "p3",
    name: "Q3 Marketing Campaign",
    description: "Plan and launch the summer campaign.",
    color: "#F59E0B",
    memberIds: ["u1", "u2"],
    createdAt: "2026-06-01T08:15:00Z"
  }
];

export const initialTasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Design new landing page hero",
    description: "Create 2–3 hero concepts with the blue accent palette.",
    assigneeId: "u2",
    assigneeIds: ["u2"],
    priority: "high",
    status: "in_progress",
    deadline: "2026-07-03",
    commentCount: 2,
    createdAt: "2026-06-20T10:00:00Z",
    order: 1
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Build responsive navbar component",
    description: "Sidebar collapses to icon rail under 1024px.",
    assigneeId: "u3",
    assigneeIds: ["u3"],
    priority: "medium",
    status: "todo",
    deadline: "2026-07-08",
    commentCount: 0,
    createdAt: "2026-06-21T11:20:00Z",
    order: 1
  },
  {
    id: "t3",
    projectId: "p1",
    title: "Audit color contrast for accessibility",
    description: "Ensure all text meets WCAG AA against backgrounds.",
    assigneeId: "u2",
    assigneeIds: ["u2"],
    priority: "low",
    status: "done",
    deadline: "2026-06-25",
    commentCount: 1,
    createdAt: "2026-06-18T09:45:00Z",
    order: 1
  },
  {
    id: "t4",
    projectId: "p2",
    title: "Implement offline task cache",
    description: "Cache tasks locally so the board loads without a connection.",
    assigneeId: "u5",
    assigneeIds: ["u5"],
    priority: "urgent",
    status: "in_progress",
    deadline: "2026-07-01",
    commentCount: 3,
    createdAt: "2026-06-15T13:00:00Z",
    order: 2
  },
  {
    id: "t5",
    projectId: "p2",
    title: "Write E2E tests for onboarding",
    description: "Cover the first-run flow end to end.",
    assigneeId: "u4",
    assigneeIds: ["u4"],
    priority: "medium",
    status: "todo",
    deadline: "2026-07-12",
    commentCount: 0,
    createdAt: "2026-06-22T16:10:00Z",
    order: 2
  },
  {
    id: "t6",
    projectId: "p2",
    title: "Fix crash on task drag (Android)",
    description: "Reproduces on Android 13 when dropping into Done.",
    assigneeId: "u3",
    assigneeIds: ["u3"],
    priority: "high",
    status: "in_review",
    deadline: "2026-07-02",
    commentCount: 4,
    createdAt: "2026-06-19T08:30:00Z",
    order: 1
  },
  {
    id: "t7",
    projectId: "p3",
    title: "Draft campaign messaging",
    description: "Three headline options for the summer push.",
    assigneeId: "u1",
    assigneeIds: ["u1"],
    priority: "high",
    status: "in_progress",
    deadline: "2026-07-05",
    commentCount: 1,
    createdAt: "2026-06-23T10:05:00Z",
    order: 1
  },
  {
    id: "t8",
    projectId: "p3",
    title: "Design social media templates",
    description: "Instagram + LinkedIn sizes in brand colors.",
    assigneeId: "u2",
    assigneeIds: ["u2"],
    priority: "medium",
    status: "todo",
    deadline: "2026-07-15",
    commentCount: 0,
    createdAt: "2026-06-24T09:00:00Z",
    order: 2
  },
  {
    id: "t9",
    projectId: "p3",
    title: "Book ad placements",
    description: "Confirm budget and lock in placements.",
    assigneeId: "u1",
    assigneeIds: ["u1"],
    priority: "urgent",
    status: "done",
    deadline: "2026-06-28",
    commentCount: 2,
    createdAt: "2026-06-16T12:00:00Z",
    order: 1
  }
];

export const initialComments: Comment[] = [
  { id: "c1", taskId: "t1", authorId: "u1", body: "Love the direction — can we try a bolder blue on concept 2?", createdAt: "2026-06-24T09:30:00Z" },
  { id: "c2", taskId: "t1", authorId: "u2", body: "On it. Will post updated versions by EOD.", createdAt: "2026-06-24T10:15:00Z" },
  { id: "c3", taskId: "t3", authorId: "u3", body: "All passing AA now except the muted captions — bumped their color.", createdAt: "2026-06-25T14:00:00Z" },
  { id: "c4", taskId: "t4", authorId: "u5", body: "Cache works offline; still handling the sync-on-reconnect edge case.", createdAt: "2026-06-26T11:45:00Z" },
  { id: "c5", taskId: "t6", authorId: "u4", body: "Reproduced on my Pixel. Steps attached below.", createdAt: "2026-06-22T08:50:00Z" },
  { id: "c6", taskId: "t6", authorId: "u3", body: "Fix pushed — moving to review.", createdAt: "2026-06-23T15:20:00Z" }
];

export const currentUser = { currentUserId: "u1" };
