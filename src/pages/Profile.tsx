import React from 'react';
import { useAuthStore } from '../stores/authStore';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-12">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-blue-600">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
            <p className="text-blue-100">{user?.email}</p>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="mt-1 text-gray-900">{user?.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-gray-900">{user?.email || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Role</label>
                  <p className="mt-1 text-gray-900">{user?.role || 'Member'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Member Since</label>
                  <p className="mt-1 text-gray-900">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Change Password
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;