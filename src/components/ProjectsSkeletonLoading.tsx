"use client";

import React from "react";

const ProjectsSkeletonLoading = () => {
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="pl-8 pr-8 pb-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletonItems.map((item) => (
          <div
            key={item}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b">
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="flex items-center">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSkeletonLoading;
