import { APP_NAME } from '../../config';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = 'Loading application...' }: LoadingScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 mx-auto text-primary-600 animate-spin" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">{APP_NAME}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;