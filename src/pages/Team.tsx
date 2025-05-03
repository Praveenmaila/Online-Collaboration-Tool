import React from 'react';

function Team() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Team Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Team member cards will be populated with actual data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-600">JD</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">John Doe</h3>
              <p className="text-gray-600">Lead Developer</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">john.doe@example.com</p>
            <div className="mt-2 flex space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Frontend</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">React</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;