import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../modules/Auth/AuthContext';

const MenuBar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  return (
    <nav className="bg-gray-800 text-white px-4 py-2 flex gap-4">
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/candidate" className="hover:underline">Candidates</Link>
      <Link to="/feedback" className="hover:underline">Feedback</Link>
      <Link to="/competency" className="hover:underline">Competency</Link>
      <Link to="/recommendation" className="hover:underline">Recommendation</Link>
      {role === 'Admin' && (
        <Link to="/admin/email-templates" className="hover:underline">Email Templates</Link>
      )}
      {/* Add more links per role as needed */}
    </nav>
  );
};

export default MenuBar;
