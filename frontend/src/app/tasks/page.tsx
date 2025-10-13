'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Task, TaskFilters, TaskStatus, TaskPriority, User, Project } from '@/types';
import apiClient from '@/lib/api';
import { formatDate, enumToDisplayText, getPriorityColor, getStatusColor } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { Plus, Search, Filter, Edit, Trash2, Users, Calendar, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }

    if (user) {
      loadTasks();
      loadProjects();
    }
  }, [user, authLoading, router]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const filters: TaskFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter as TaskStatus;
      if (priorityFilter) filters.priority = priorityFilter as TaskPriority;
      if (projectFilter) filters.projectId = projectFilter;

      const response = await apiClient.getTasks(filters);
      if (response.success && response.data) {
        setTasks(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects({});
      if (response.success && response.data) {
        setProjects(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteTask(taskId);
      toast.success('Task deleted successfully');
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await apiClient.updateTask(taskId, { status: newStatus });
      toast.success('Task status updated');
      loadTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesProject = !projectFilter || (typeof task.projectId === 'object' ? task.projectId._id === projectFilter : task.projectId === projectFilter);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !['completed', 'cancelled'].includes(statusFilter);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const kanbanColumns = [
    { status: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { status: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { status: 'review', title: 'In Review', color: 'bg-yellow-100' },
    { status: 'testing', title: 'Testing', color: 'bg-purple-100' },
    { status: 'completed', title: 'Completed', color: 'bg-green-100' },
    { status: 'blocked', title: 'Blocked', color: 'bg-red-100' },
  ];

  return (
    <AppLayout>
      <div className="bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-600">Manage your tasks and track progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                    }`}
                  >
                    Kanban
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="testing">Testing</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadTasks}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tasks View */}
        {viewMode === 'list' ? (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600 mb-6">
                  No tasks match your current filters or you haven't created any tasks yet.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Task
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          {isOverdue(task.dueDate) && (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {enumToDisplayText(task.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {enumToDisplayText(task.priority)}
                          </span>
                          <span className="text-sm text-gray-600">
                            Project: {typeof task.projectId === 'object' ? task.projectId.title : 'Unknown'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                              Due: {formatDate(task.dueDate)}
                            </span>
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {typeof task.assignedTo === 'object' 
                                  ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                  : 'Assigned'}
                              </span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{task.estimatedHours}h estimated</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value as TaskStatus)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">In Review</option>
                          <option value="testing">Testing</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <button
                          onClick={() => router.push(`/tasks/${task._id}` as any)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Kanban View
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 overflow-x-auto">
            {kanbanColumns.map((column) => {
              const columnTasks = filteredTasks.filter(task => task.status === column.status);
              
              return (
                <div key={column.status} className="min-w-80 lg:min-w-0">
                  <div className={`${column.color} rounded-lg p-4 mb-4`}>
                    <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    <span className="text-sm text-gray-600">({columnTasks.length})</span>
                  </div>
                  
                  <div className="space-y-4">
                    {columnTasks.map((task) => (
                      <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {enumToDisplayText(task.priority)}
                          </span>
                          {isOverdue(task.dueDate) && (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <div className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
                            Due: {formatDate(task.dueDate)}
                          </div>
                          {task.assignedTo && typeof task.assignedTo === 'object' && (
                            <div className="mt-1">
                              Assigned: {task.assignedTo.firstName} {task.assignedTo.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTasks();
          }}
          projects={projects}
        />
      )}
      </div>
    </AppLayout>
  );
}

// Placeholder for CreateTaskModal component
function CreateTaskModal({ 
  onClose, 
  onSuccess, 
  projects 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  projects: Project[];
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
        <p className="text-gray-600 mb-4">Task creation modal will be implemented next.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}