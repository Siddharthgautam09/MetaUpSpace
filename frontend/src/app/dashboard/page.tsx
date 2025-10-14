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
      // Load analytics, projects, and tasks in parallel
      const [analyticsRes, projectsRes, tasksRes] = await Promise.all([
        apiClient.getDashboardAnalytics(),
        apiClient.getProjects({ limit: 100 }),
        apiClient.getTasks({ limit: 100 }),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      
      // Ensure we always set arrays to avoid runtime errors if API returns unexpected shapes
      if (projectsRes && (projectsRes as any).data) {
        // support both shapes: { data: { items: [...] } } and { items: [...] }
        const items = (projectsRes as any).data?.items ?? (projectsRes as any).items ?? [];
        setProjects(Array.isArray(items) ? items : []);
      } else {
        setProjects([]);
      }

      if (tasksRes && (tasksRes as any).data) {
        const items = (tasksRes as any).data?.items ?? (tasksRes as any).items ?? [];
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

              {/* Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Task Status Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tasks by Status
                  </h3>
                  <div className="space-y-3">
                    {analytics.taskStats.map((stat) => (
                      <div
                        key={stat._id}
                        className="flex items-center justify-between"
                      >
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
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tasks by Priority
                  </h3>
                  <div className="space-y-3">
                    {analytics.priorityStats.map((stat) => (
                      <div
                        key={stat._id}
                        className="flex items-center justify-between"
                      >
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
                          {stat.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Status */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Projects by Status
                  </h3>
                  <div className="space-y-3">
                    {analytics.projectStats.map((stat) => (
                      <div
                        key={stat._id}
                        className="flex items-center justify-between"
                      >
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
                          {stat.count}
                        </span>
                      </div>
                    ))}
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

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.recentActivity.slice(0, 10).map((task) => (
                        <div
                          key={task._id}
                          className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </p>
                            <div className="flex items-center mt-1 space-x-2">
                              <p className="text-xs text-gray-600">
                                Project: {getProjectTitle(task.projectId)}
                              </p>
                              {task.assignedTo && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <p className="text-xs text-gray-600">
                                    Assigned to: {getUserName(task.assignedTo as any)}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {enumToDisplayText(task.status)}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {enumToDisplayText(task.priority)}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDate(task.updatedAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* All Projects Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                All Projects
              </h3>
              <span className="text-sm text-gray-500">
                {projects.length} total
              </span>
            </div>
            <div className="p-6">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`/projects` as any)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {project.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {enumToDisplayText(project.priority)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                        {project.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status:</span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {enumToDisplayText(project.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Manager:</span>
                          <span className="text-xs text-gray-900">
                            {getUserName(project.managerId as any)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Team:</span>
                          <span className="text-xs text-gray-900">
                            {Array.isArray(project.teamMembers)
                              ? project.teamMembers.length
                              : 0}{" "}
                            members
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Deadline:</span>
                          <span className="text-xs text-gray-900">
                            {formatDate(project.deadline)}
                          </span>
                        </div>
                        {project.budget && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Budget:</span>
                            <span className="text-xs text-gray-900">
                              ${project.budget.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No projects found
                </p>
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
                {tasks.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
              {tasks.length > 0 ? (
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
                    {tasks.map((task) => (
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
