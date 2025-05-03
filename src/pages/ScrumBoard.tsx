import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProjectStore } from '../stores/projectStore';
import { Plus, MoreVertical } from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';

const ScrumBoard = () => {
  const { projectId } = useParams();
  const { 
    currentProject,
    userStories,
    fetchProjectById,
    fetchUserStories,
    updateUserStory,
    isLoading 
  } = useProjectStore();
  
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchUserStories(projectId);
    }
  }, [projectId]);
  
  const columns = {
    backlog: {
      title: 'Backlog',
      items: userStories.filter(story => story.status === 'backlog'),
    },
    todo: {
      title: 'To Do',
      items: userStories.filter(story => story.status === 'todo'),
    },
    inProgress: {
      title: 'In Progress',
      items: userStories.filter(story => story.status === 'inProgress'),
    },
    review: {
      title: 'Review',
      items: userStories.filter(story => story.status === 'review'),
    },
    done: {
      title: 'Done',
      items: userStories.filter(story => story.status === 'done'),
    },
  };
  
  const onDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      return;
    }
    
    // Update the story status
    const story = userStories.find(s => s._id === draggableId);
    if (story) {
      await updateUserStory(story._id, {
        ...story,
        status: destination.droppableId,
      });
    }
  };
  
  if (isLoading) {
    return <LoadingScreen message="Loading board..." />;
  }
  
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sprint Board</h1>
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop stories to update their status
          </p>
        </div>
        <button className="btn-primary flex items-center gap-1">
          <Plus size={16} />
          Add Story
        </button>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {column.title}
                  <span className="ml-2 text-gray-500">
                    ({column.items.length})
                  </span>
                </h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {column.items.map((story, index) => (
                      <Draggable
                        key={story._id}
                        draggableId={story._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-md shadow p-3"
                          >
                            <h4 className="text-sm font-medium text-gray-900">
                              {story.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                              {story.description}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                story.priority === 'high'
                                  ? 'bg-red-100 text-red-800'
                                  : story.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {story.priority}
                              </span>
                              {story.assignee && (
                                <div className="flex items-center">
                                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {story.assignee.name.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ScrumBoard;