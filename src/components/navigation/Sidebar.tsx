import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Briefcase, Calendar, Settings, ChevronLeft, 
  LayoutDashboard, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { APP_NAME } from '../../config';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed z-30 inset-y-0 left-0 w-64 transition-transform duration-300 transform bg-primary-800 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-primary-900 text-white">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
            <Briefcase size={24} />
            <span>{APP_NAME}</span>
          </Link>
          
          <button onClick={toggleSidebar} className="md:hidden text-white">
            <ChevronLeft size={20} />
          </button>
        </div>
        
        <div className="flex flex-col h-full overflow-y-auto">
          {/* User info */}
          <div className="px-4 py-6 border-b border-primary-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-primary-300">{user?.role}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link 
              to="/" 
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/') 
                  ? 'bg-primary-700 text-white' 
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <LayoutDashboard className="mr-3 h-6 w-6" />
              Dashboard
            </Link>
            
            <Link 
              to="/projects" 
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location.pathname.startsWith('/projects') 
                  ? 'bg-primary-700 text-white' 
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <Briefcase className="mr-3 h-6 w-6" />
              Projects
            </Link>
            
            <Link 
              to="/team" 
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/team') 
                  ? 'bg-primary-700 text-white' 
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <Users className="mr-3 h-6 w-6" />
              Team
            </Link>
            
            <Link 
              to="/profile" 
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                isActive('/profile') 
                  ? 'bg-primary-700 text-white' 
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white'
              }`}
            >
              <Settings className="mr-3 h-6 w-6" />
              My Profile
            </Link>
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t border-primary-700">
            <button 
              onClick={() => logout()}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-primary-100 rounded-md hover:bg-primary-700 hover:text-white"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile open button - when sidebar is closed */}
      {!isOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed z-20 left-4 top-4 md:hidden flex items-center justify-center h-10 w-10 rounded-md bg-white shadow"
        >
          <ChevronRight size={20} className="text-primary-600" />
        </button>
      )}
    </>
  );
};

export default Sidebar;