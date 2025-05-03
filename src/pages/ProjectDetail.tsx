import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Users, Settings, Trash2, LayoutDashboard, Plus, 
  Calendar, CheckSquare, AlertCircle 
} from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentProject,
    fetchProjectById,
    updateProject,
    deleteProject,
    isLoading,
    error 
  } = useProjectStore();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    }
  }, [projectId, fetchProjectById]);
  
  if (isLoading) {
    return <LoadingScreen message="Loading project details..." />;
  }
  
  if (!currentProject) {
    return (
      <div className="text-center mt-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }
  
  const isOwner = currentProject.owner === user?._id;
  
  const handleDelete = async () => {
    try {
      await deleteProject(currentProject._id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            {currentProject.name}
            <span className="text-sm font-normal text-gray-500">({currentProject.key})</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {currentProject.description || 'No description provided.'}
          </p>
        </div>
        <div className="mt-4 flex justify-end space-x-3 md:mt-0">
          {isOwner && (
            <>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <Link
                to={`/projects/${currentProject._id}/settings`}
                className="btn-outline flex items-center gap-1"
              >
                <Settings size={16} />
                Settings
              </Link>
            </>
          )}
          <Link
            to={`/projects/${currentProject._id}/board`}
            className="btn-primary flex items-center gap-1"
          >
            <LayoutDashboard size={16} />
            View Board
          </Link>
        </div>
      </div>
      
      {/* Project stats */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Team Members
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {currentProject.members?.length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-primary-600 hover:text-primary-500">
                Manage team
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Sprint
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    Sprint 1
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-primary-600 hover:text-primary-500">
                View sprint
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Tasks
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    0/0
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-primary-600 hover:text-primary-500">
                View all tasks
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Days Remaining
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    14
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <button className="font-medium text-primary-600 hover:text-primary-500">
                View timeline
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Project
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this project? This action cannot be undone.
                      All data associated with this project will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;