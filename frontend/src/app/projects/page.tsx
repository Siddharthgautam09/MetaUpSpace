"use client";

import React from "react";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Project,
  ProjectFilters,
  ProjectStatus,
  ProjectPriority,
  User,
} from "@/types";
import apiClient from "@/lib/api";
import {
  formatDate,
  enumToDisplayText,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Use current user as manager if admin
  const managerId = user?._id || "";
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ProjectStatus | "all">("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }

    if (user) {
      loadProjects();
    }
  }, [user, authLoading, router]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const filters: ProjectFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter) filters.status = statusFilter as ProjectStatus;
      if (priorityFilter) filters.priority = priorityFilter as ProjectPriority;

      const response = await apiClient.getProjects(filters);
      if (response.success && response.data) {
        setProjects(response.data.items || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteProject(projectId);
      toast.success("Project deleted successfully");
      loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority =
      !priorityFilter || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const canCreateProject = user.role === "admin" || user.role === "manager";

  return (
    <AppLayout>
      <div className="bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-sm text-gray-600">
                  Manage your team projects
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {canCreateProject && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Status Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 px-6" aria-label="Tabs">
                <button
                  onClick={() => {
                    setSelectedTab("all");
                    setStatusFilter("");
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === "all"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  All Projects ({projects.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab(ProjectStatus.PLANNING);
                    setStatusFilter(ProjectStatus.PLANNING);
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === ProjectStatus.PLANNING
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Planning ({projects.filter(p => p.status === ProjectStatus.PLANNING).length})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab(ProjectStatus.IN_PROGRESS);
                    setStatusFilter(ProjectStatus.IN_PROGRESS);
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === ProjectStatus.IN_PROGRESS
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  In Progress ({projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab(ProjectStatus.TESTING);
                    setStatusFilter(ProjectStatus.TESTING);
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === ProjectStatus.TESTING
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Testing ({projects.filter(p => p.status === ProjectStatus.TESTING).length})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab(ProjectStatus.COMPLETED);
                    setStatusFilter(ProjectStatus.COMPLETED);
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === ProjectStatus.COMPLETED
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Completed ({projects.filter(p => p.status === ProjectStatus.COMPLETED).length})
                </button>
                <button
                  onClick={() => {
                    setSelectedTab(ProjectStatus.ON_HOLD);
                    setStatusFilter(ProjectStatus.ON_HOLD);
                  }}
                  className={`py-4 px-3 border-b-2 font-medium text-sm ${
                    selectedTab === ProjectStatus.ON_HOLD
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  On Hold ({projects.filter(p => p.status === ProjectStatus.ON_HOLD).length})
                </button>
              </nav>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button
                onClick={loadProjects}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6">
                {canCreateProject
                  ? "Get started by creating your first project."
                  : "No projects match your current filters."}
              </p>
              {canCreateProject && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {enumToDisplayText(project.status)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            project.priority
                          )}`}
                        >
                          {enumToDisplayText(project.priority)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          router.push(`/projects/${project._id}` as any)
                        }
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {canCreateProject && (
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Deadline:</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatDate(project.deadline)}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Team:</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {project.teamMembers?.length || 0} members
                      </span>
                    </div>
                    {project.budget && (
                      <div className="flex items-center justify-between text-gray-600">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>Budget:</span>
                        </div>
                        <span className="font-medium text-gray-900">${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                    {project.estimatedHours && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Estimated Hours:</span>
                        <span className="font-medium text-gray-900">{project.estimatedHours}h</span>
                      </div>
                    )}
                    {project.actualHours && (
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Actual Hours:</span>
                        <span className="font-medium text-gray-900">{project.actualHours}h</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Manager:</span>
                        <span className="font-medium">
                          {typeof project.managerId === "object"
                            ? `${project.managerId.firstName} ${project.managerId.lastName}`
                            : "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                    {project.tags && project.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadProjects();
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}

// Placeholder for CreateProjectModal component


function CreateProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(ProjectPriority.MEDIUM);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  // Use current user as manager if admin
  const { user } = useAuth();
  const managerId = user?._id || "";

  useEffect(() => {
    // Fetch all users for team assignment
    const fetchUsers = async () => {
      try {
        const res = await apiClient.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        toast.error("Failed to load users");
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.createProject({
        title,
        description,
        deadline,
        priority,
        managerId,
        teamMembers: selectedTeamMembers,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      toast.success("Project created successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as ProjectPriority)}
            className="w-full border rounded px-3 py-2"
          >
            <option value={ProjectPriority.LOW}>Low</option>
            <option value={ProjectPriority.MEDIUM}>Medium</option>
            <option value={ProjectPriority.HIGH}>High</option>
            <option value={ProjectPriority.CRITICAL}>Critical</option>
          </select>
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {/* Team members multi-select (exclude admins) */}
          <label className="block text-sm font-medium">Assign Team Members</label>
          <select
            multiple
            value={selectedTeamMembers}
            onChange={e => {
              const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
              setSelectedTeamMembers(options);
            }}
            className="w-full border rounded px-3 py-2 h-32"
          >
            {users.filter(u => u.role !== 'admin').map(u => (
              <option key={u._id} value={u._id}>
                {u.firstName} {u.lastName} ({u.email})
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
