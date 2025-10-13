"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DashboardAnalytics } from "@/types";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login" as any);
      return;
    }

    if (user) {
      loadAnalytics();
    }
  }, [user, authLoading, router]);

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getDashboardAnalytics();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
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

  return (
    <AppLayout>
      <div className="bg-gray-50">
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

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                        <div className="flex items-center">
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
                        <div className="flex items-center">
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
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  {analytics.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.recentActivity.slice(0, 5).map((task) => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-600">
                              {typeof task.projectId === "object"
                                ? task.projectId.title
                                : "Unknown Project"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {enumToDisplayText(task.status)}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {enumToDisplayText(task.priority)}
                            </span>
                            <span className="text-xs text-gray-500">
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
        </main>
      </div>
    </AppLayout>
  );
}
