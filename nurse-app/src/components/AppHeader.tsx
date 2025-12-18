/**
 * App Header Component
 * Displays nurse info, current time, shift info, and quick stats
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

export const AppHeader: React.FC = () => {
  const { currentNurse, entriesCompletedToday, timeSavedEstimate } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShiftInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 7 && hour < 15) {
      return { shift: 'Day Shift', time: '07:00 - 15:00' };
    } else if (hour >= 15 && hour < 23) {
      return { shift: 'Evening Shift', time: '15:00 - 23:00' };
    } else {
      return { shift: 'Night Shift', time: '23:00 - 07:00' };
    }
  };

  const shiftInfo = getShiftInfo();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">V</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Voize US</h1>
                <p className="text-sm text-gray-600">Nurse Documentation</p>
              </div>
            </div>
          </div>

          {/* Center - Nurse Info and Shift */}
          <div className="flex items-center gap-8">
            {/* Current Nurse */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 text-lg font-semibold">
                  {currentNurse.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{currentNurse.name}</div>
                <div className="text-xs text-gray-600">
                  {currentNurse.credentials} • {currentNurse.department}
                </div>
              </div>
            </div>

            {/* Shift Info */}
            <div className="border-l border-gray-300 pl-6">
              <div className="text-sm font-semibold text-gray-900">{shiftInfo.shift}</div>
              <div className="text-xs text-gray-600">{shiftInfo.time}</div>
            </div>

            {/* Current Time */}
            <div className="border-l border-gray-300 pl-6">
              <div className="text-sm font-semibold text-gray-900">{formatTime(currentTime)}</div>
              <div className="text-xs text-gray-600">
                {currentTime.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* Right - Quick Stats */}
          <div className="flex items-center gap-6">
            {/* Entries Today */}
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">{entriesCompletedToday}</div>
              <div className="text-xs text-green-600 font-medium">Entries Today</div>
            </div>

            {/* Time Saved */}
            <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{timeSavedEstimate}</div>
              <div className="text-xs text-blue-600 font-medium">Minutes Saved</div>
            </div>

            {/* Profile & Settings */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
