import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('spotify_access_token');
    if (!accessToken) {
      navigate('/');
      return;
    }

    // Fetch user profile from Spotify
    axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      setUserProfile(response.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        // Token expired, redirect to login
        localStorage.clear();
        navigate('/');
      }
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {userProfile && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {userProfile.display_name}!</h1>
              <p className="text-gray-600">{userProfile.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          {/* Add your playlist components here */}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
