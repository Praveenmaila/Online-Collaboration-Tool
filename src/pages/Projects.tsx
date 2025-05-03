import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjectStore } from '../stores/projectStore';
import { Plus, Briefcase, Search } from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

const Projects = () => {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.key.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return <LoadingScreen message="Loading projects..." />;
  }
  
  return (
    <div className="animate-fade-in">
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and collaborate on your team's projects
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/projects/new"
            className="btn-primary flex items-center gap-1"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>
      
      {/* Search */}
      <div className="mt-6">
        <div className="relative rounded-md shadow-sm max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Project list */}
      {filteredProjects.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 p-2 rounded-md">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-500 font-medium">
                        {project.key}
                      </span>
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        project.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : project.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <div className="font-medium text-primary-600">
                    View details
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
          <div className="mt-6">
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;