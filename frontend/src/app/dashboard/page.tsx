"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DashboardAnalytics, Project, Task, User } from "@/types";
import apiClient from "@/lib/api";
import {
  formatDate,
  enumToDisplayText,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import AppLayout from "@/components/AppLayout";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login" as any);
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("Loading dashboard data...");
      
      // Load analytics, projects, and tasks in parallel
      const [analyticsRes, projectsRes, tasksRes] = await Promise.all([
        apiClient.getDashboardAnalytics(),
        apiClient.getProjects({ limit: 100 }),
        apiClient.getTasks({ limit: 100 }),
      ]);

      console.log("Analytics response:", analyticsRes);
      console.log("Projects response:", projectsRes);
      console.log("Tasks response:", tasksRes);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      
      // Ensure we always set arrays to avoid runtime errors if API returns unexpected shapes
      if (projectsRes && (projectsRes as any).data) {
        // support both shapes: { data: { items: [...] } } and { items: [...] }
        const items = (projectsRes as any).data?.projects ?? (projectsRes as any).data?.items ?? (projectsRes as any).items ?? [];
        console.log("Projects items:", items);
        setProjects(Array.isArray(items) ? items : []);
      } else {
        setProjects([]);
      }

      if (tasksRes && (tasksRes as any).data) {
        const items = (tasksRes as any).data?.tasks ?? (tasksRes as any).data?.items ?? (tasksRes as any).items ?? [];
        console.log("Tasks items:", items);
        setTasks(Array.isArray(items) ? items : []);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return null;
  }

  // Role-based data filtering
  const filteredProjects = projects.filter(project => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can only view projects they're assigned to
    if (user.role === "team_member") {
      const teamMemberIds = Array.isArray(project.teamMembers) 
        ? project.teamMembers.map(tm => typeof tm === 'string' ? tm : tm._id)
        : [];
      return teamMemberIds.includes(user._id);
    }
    return false;
  });

  const filteredTasks = tasks.filter(task => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // Team members can view tasks assigned to them or in projects they're assigned to
    if (user.role === "team_member") {
      const assignedToId = typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?._id;
      if (assignedToId === user._id) return true;
      
      // Check if user is in the project team
      const project = projects.find(p => p._id === (typeof task.projectId === 'string' ? task.projectId : task.projectId?._id));
      if (project) {
        const teamMemberIds = Array.isArray(project.teamMembers) 
          ? project.teamMembers.map(tm => typeof tm === 'string' ? tm : tm._id)
          : [];
        return teamMemberIds.includes(user._id);
      }
    }
    return false;
  });

  // Helper function to get user name
  const getUserName = (userObj: User | string | undefined) => {
    if (!userObj) return "Unassigned";
    if (typeof userObj === "string") return "Unknown";
    return `${userObj.firstName} ${userObj.lastName}`;
  };

  // Helper function to get project title
  const getProjectTitle = (projectObj: any) => {
    if (!projectObj) return "Unknown Project";
    if (typeof projectObj === "string") return projectObj;
    return projectObj.title;
  };

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user.firstName}! 
                  {user.role === "admin" ? " Manage your organization." : " View your assigned work."}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {enumToDisplayText(user.role)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Total Projects
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.overview.totalProjects}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Total Tasks
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.overview.totalTasks}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Completed Tasks
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {analytics.overview.completedTasks}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {analytics.overview.completionRate.toFixed(1)}% completion rate
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">
                        Overdue Tasks
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {analytics.overview.overdueTasks}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Section - Detailed Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Task Status Chart with Details */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tasks by Status
                  </h3>
                  <div className="space-y-4">
                    {analytics.taskStats.map((stat) => {
                      const statusTasks = filteredTasks.filter(t => t.status === stat._id);
                      const percentage = analytics.overview.totalTasks > 0 
                        ? ((stat.count / analytics.overview.totalTasks) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={stat._id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getStatusColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {stat.totalEstimatedHours && (
                            <div className="ml-6 text-xs text-gray-500">
                              Est: {stat.totalEstimatedHours}h
                              {stat.totalActualHours && ` | Actual: ${stat.totalActualHours}h`}
                            </div>
                          )}
                          {statusTasks.length > 0 && statusTasks.length <= 3 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {statusTasks.slice(0, 3).map(task => (
                                <div key={task._id} className="text-xs text-gray-600 truncate">
                                  • {task.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Priority Distribution with Details */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tasks by Priority
                  </h3>
                  <div className="space-y-4">
                    {analytics.priorityStats.map((stat) => {
                      const priorityTasks = filteredTasks.filter(t => t.priority === stat._id);
                      const percentage = analytics.overview.totalTasks > 0 
                        ? ((stat.count / analytics.overview.totalTasks) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={stat._id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getPriorityColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {priorityTasks.length > 0 && priorityTasks.length <= 3 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {priorityTasks.slice(0, 3).map(task => (
                                <div key={task._id} className="text-xs text-gray-600 truncate">
                                  • {task.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Project Status with Details */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Projects by Status
                  </h3>
                  <div className="space-y-4">
                    {analytics.projectStats.map((stat) => {
                      const statusProjects = filteredProjects.filter(p => p.status === stat._id);
                      const percentage = analytics.overview.totalProjects > 0 
                        ? ((stat.count / analytics.overview.totalProjects) * 100).toFixed(1)
                        : '0';
                      return (
                        <div key={stat._id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center flex-1">
                              <span
                                className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                  getStatusColor(stat._id).split(" ")[2]
                                }`}
                              ></span>
                              <span className="text-sm font-medium text-gray-700">
                                {enumToDisplayText(stat._id)}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({percentage}%)
                            </span>
                          </div>
                          {statusProjects.length > 0 && statusProjects.length <= 3 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {statusProjects.slice(0, 3).map(project => (
                                <div key={project._id} className="text-xs text-gray-600 truncate">
                                  • {project.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Team Workload (for admins and managers) */}
              {analytics.teamWorkload && analytics.teamWorkload.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Team Workload
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team Member
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Tasks
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            In Progress
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completed
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Overdue
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Completion Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.teamWorkload.map((member) => (
                          <tr key={member.userId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {member.userName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.userEmail}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                              {member.totalTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-blue-600">
                              {member.inProgressTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                              {member.completedTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600">
                              {member.overdueTasks}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`text-sm font-medium ${
                                member.completionRate >= 80 ? 'text-green-600' :
                                member.completionRate >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {member.completionRate.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* All Projects Section - Enhanced with Complete Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Projects Created
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {filteredProjects.length} total projects
                  </span>
                  <button
                    onClick={() => {
                      console.log("Current projects:", projects);
                      router.push(`/projects` as any);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-gray-50"
                      onClick={() => router.push(`/projects` as any)}
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-gray-900 line-clamp-2 flex-1">
                            {project.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {enumToDisplayText(project.status)}
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              project.priority
                            )}`}
                          >
                            {enumToDisplayText(project.priority)}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 min-h-[3.5rem]">
                        {project.description}
                      </p>

                      {/* Details Grid */}
                      <div className="space-y-3 mb-4">
                        {/* Manager */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">👤 Manager:</span>
                          <span className="text-gray-900 font-semibold">
                            {getUserName(project.managerId as any)}
                          </span>
                        </div>

                        {/* Team Size */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">👥 Team Size:</span>
                          <span className="text-gray-900 font-semibold">
                            {Array.isArray(project.teamMembers)
                              ? project.teamMembers.length
                              : 0}{" "}
                            members
                          </span>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">📅 Deadline:</span>
                          <span className="text-gray-900 font-semibold">
                            {formatDate(project.deadline)}
                          </span>
                        </div>

                        {/* Estimated Hours */}
                        {project.estimatedHours && project.estimatedHours > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">⏱️ Est. Hours:</span>
                            <span className="text-gray-900 font-semibold">
                              {project.estimatedHours}h
                            </span>
                          </div>
                        )}

                        {/* Actual Hours */}
                        {project.actualHours && project.actualHours > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">⏰ Actual Hours:</span>
                            <span className="text-gray-900 font-semibold">
                              {project.actualHours}h
                              {project.estimatedHours && (
                                <span className={`ml-1 text-xs ${
                                  project.actualHours > project.estimatedHours 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                  ({project.actualHours > project.estimatedHours ? '+' : ''}
                                  {((project.actualHours / project.estimatedHours - 1) * 100).toFixed(0)}%)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {project.tags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {project.tags.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                +{project.tags.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer - Timestamps */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">Created:</span>
                            <br />
                            <span className="text-gray-900">{formatDate(project.createdAt)}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">Updated:</span>
                            <br />
                            <span className="text-gray-900">{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Members Preview (if populated) */}
                      {Array.isArray(project.teamMembers) && project.teamMembers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-xs font-medium text-gray-500 mb-2">Team Members:</div>
                          <div className="flex -space-x-2">
                            {project.teamMembers.slice(0, 5).map((member: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                                title={typeof member === 'object' ? `${member.firstName} ${member.lastName}` : 'Team Member'}
                              >
                                {typeof member === 'object' 
                                  ? `${member.firstName?.[0]}${member.lastName?.[0]}`.toUpperCase()
                                  : '?'}
                              </div>
                            ))}
                            {project.teamMembers.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white shadow-sm">
                                +{project.teamMembers.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Progress Indicator (if applicable) */}
                      {project.status === 'in_progress' && project.estimatedHours && project.actualHours && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-medium text-gray-700">Progress</span>
                            <span className="font-semibold text-gray-900">
                              {Math.min(100, Math.round((project.actualHours / project.estimatedHours) * 100))}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (project.actualHours / project.estimatedHours) > 1 
                                  ? 'bg-red-500' 
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min(100, (project.actualHours / project.estimatedHours) * 100)}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h4>
                  <p className="text-gray-600 mb-4">
                    {user.role === 'admin' || user.role === 'manager' 
                      ? "Get started by creating your first project or refresh to see existing projects" 
                      : "No projects have been created yet or you don't have access to view them"
                    }
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => router.push(`/projects` as any)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Go to Projects
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All Tasks Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                All Tasks
              </h3>
              <span className="text-sm text-gray-500">
                {filteredTasks.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
              {filteredTasks.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr
                        key={task._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/tasks` as any)}
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {task.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getProjectTitle(task.projectId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getUserName(task.assignedTo as any)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {enumToDisplayText(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {enumToDisplayText(task.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(task.dueDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 text-center py-8">No tasks found</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
