import React from 'react';
import { CheckCircle, Clock, Bell } from 'lucide-react';

interface MyDayTodayProps {
  userId: string;
}

export const MyDayToday: React.FC<MyDayTodayProps> = ({ userId }) => {
  return (
    <div className= "bg-white rounded-lg shadow-lg p-6">
      <div className= "flex items-center justify-between mb-6">
        <h3 className= "text-xl font-semibold">My Day</h3>
        <div className= "flex space-x-2">
          <button className= "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Task
          </button>
          <button className= "bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
            Schedule
          </button>
        </div>
      </div>

      <div className= "grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div>
          <h4 className= "font-medium mb-4 flex items-center">
            <CheckCircle className= "w-5 h-5 mr-2" />
            Today's Tasks
          </h4>
          <div className= "space-y-3">
            <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className= "flex items-center">
                <input type= "checkbox" className= "mr-3" />
                <span>Complete project proposal</span>
              </div>
              <span className= "text-sm text-gray-600">2:00 PM</span>
            </div>
            <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className= "flex items-center">
                <input type= "checkbox" className= "mr-3" />
                <span>Review client feedback</span>
              </div>
              <span className= "text-sm text-gray-600">3:30 PM</span>
            </div>
            <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className= "flex items-center">
                <input type= "checkbox" className= "mr-3" />
                <span>Team sync meeting</span>
              </div>
              <span className= "text-sm text-gray-600">4:00 PM</span>
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div>
          <h4 className= "font-medium mb-4 flex items-center">
            <Clock className= "w-5 h-5 mr-2" />
            Schedule
          </h4>
          <div className= "space-y-3">
            <div className= "p-3 bg-gray-50 rounded">
              <div className= "flex items-center justify-between">
                <span className= "font-medium">Daily Standup</span>
                <span className= "text-sm text-gray-600">9:00 AM</span>
              </div>
              <p className= "text-sm text-gray-600 mt-1">Team discussion on progress</p>
            </div>
            <div className= "p-3 bg-gray-50 rounded">
              <div className= "flex items-center justify-between">
                <span className= "font-medium">Client Meeting</span>
                <span className= "text-sm text-gray-600">11:30 AM</span>
              </div>
              <p className= "text-sm text-gray-600 mt-1">Project review with client</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminders Section */}
      <div className= "mt-6">
        <h4 className= "font-medium mb-4 flex items-center">
          <Bell className= "w-5 h-5 mr-2" />
          Reminders
        </h4>
        <div className= "space-y-3">
          <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className= "font-medium">Submit Invoice</p>
              <p className= "text-sm text-gray-600">Due today</p>
            </div>
            <button className= "text-blue-500 hover:text-blue-600">
              Mark Done
            </button>
          </div>
          <div className= "flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className= "font-medium">Update Portfolio</p>
              <p className= "text-sm text-gray-600">Due tomorrow</p>
            </div>
            <button className= "text-blue-500 hover:text-blue-600">
              Mark Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 