'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { DashboardAnalytics } from '@/types';
import apiClient from '@/lib/api';
import { formatDate, enumToDisplayText, getPriorityColor, getStatusColor } from '@/lib/utils';
import AppLayout from '@/components/AppLayout';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock,
  Target,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login' as any);
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
      console.error('Failed to load analytics:', error);
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

  if (!user || !analytics) {
    return null;
  }

  const getCompletionPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <AppLayout>
      <div className="bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-sm text-gray-600">Comprehensive insights into your projects and tasks</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadAnalytics}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalProjects}</p>
                  <p className="text-sm text-gray-500 mt-2">Active projects in system</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.overview.totalTasks}</p>
                  <p className="text-sm text-gray-500 mt-2">All tasks across projects</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.overview.completionRate}%</p>
                  <p className="text-sm text-gray-500 mt-2">Tasks completed on time</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-600">{analytics.overview.overdueTasks}</p>
                  <p className="text-sm text-gray-500 mt-2">Tasks past deadline</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Project Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h2>
              <div className="space-y-4">
                {analytics.projectStats.map((stat) => {
                  const percentage = getCompletionPercentage(stat.count, analytics.overview.totalProjects);
                  return (
                    <div key={stat._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stat._id)}`}>
                          {enumToDisplayText(stat._id)}
                        </span>
                        <span className="text-sm text-gray-600">{stat.count} projects</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task Status Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Status Distribution</h2>
              <div className="space-y-4">
                {analytics.taskStats.map((stat) => {
                  const percentage = getCompletionPercentage(stat.count, analytics.overview.totalTasks);
                  return (
                    <div key={stat._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stat._id)}`}>
                          {enumToDisplayText(stat._id)}
                        </span>
                        <span className="text-sm text-gray-600">{stat.count} tasks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Priority Analysis */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Priority Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {analytics.priorityStats.map((stat) => {
                const percentage = getCompletionPercentage(stat.count, analytics.overview.totalTasks);
                return (
                  <div key={stat._id} className="text-center">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${getPriorityColor(stat._id).replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <span className={`text-2xl font-bold ${getPriorityColor(stat._id)}`}>
                        {stat.count}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{enumToDisplayText(stat._id)}</p>
                    <p className="text-xs text-gray-500">{percentage}% of tasks</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Performance */}
          {user.role !== 'team_member' && analytics.teamWorkload.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Overview</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Tasks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        In Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Overdue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.teamWorkload.map((member) => (
                      <tr key={member.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {member.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{member.userName}</div>
                              <div className="text-sm text-gray-500">{member.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.totalTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {member.completedTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          {member.inProgressTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {member.overdueTasks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${member.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {member.completionRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {analytics.recentActivity && analytics.recentActivity.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {analytics.recentActivity.slice(0, 10).map((task) => (
                  <div key={task._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status).includes('green') ? 'bg-green-500' : getStatusColor(task.status).includes('blue') ? 'bg-blue-500' : 'bg-gray-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        {typeof task.projectId === 'object' ? task.projectId.title : 'Project'} • 
                        Updated {formatDate(task.updatedAt)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {enumToDisplayText(task.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
}