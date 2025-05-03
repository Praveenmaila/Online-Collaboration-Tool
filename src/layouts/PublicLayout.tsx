import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { APP_NAME } from '../config';
import { LayoutGroup } from '../components/common/LayoutGroup';
import { Briefcase } from 'lucide-react';

const PublicLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-accent-700 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary-600">
            <Briefcase size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {APP_NAME}
        </h2>
        <p className="mt-2 text-center text-sm text-white opacity-80">
          Collaborate effectively with your team using Scrum methodology
        </p>
      </div>

      <LayoutGroup>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <Outlet />
          </div>
        </div>
      </LayoutGroup>
    </div>
  );
};

export default PublicLayout;