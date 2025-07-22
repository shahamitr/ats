import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="py-2 px-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b">
              {[...Array(cols)].map((_, j) => (
                <td key={j} className="py-2 px-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonLoader;