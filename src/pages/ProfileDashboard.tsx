import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { ServiceProvider } from '../lib/supabase';

export default function ProfileDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [savedProviders, setSavedProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchSavedProviders();
  }, [user, navigate]);

  const fetchSavedProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: savedData, error: savedError } = await supabase
        .from('saved_providers')
        .select('provider_id')
        .eq('user_id', user?.id);

      if (savedError) throw savedError;

      if (savedData && savedData.length > 0) {
        const providerIds = savedData.map(item => item.provider_id);
        
        const { data: providersData, error: providersError } = await supabase
          .from('service_providers')
          .select('*')
          .in('id', providerIds);

        if (providersError) throw providersError;
        setSavedProviders(providersData || []);
      } else {
        setSavedProviders([]);
      }
    } catch (err) {
      console.error('Error fetching saved providers:', err);
      setError('Failed to load saved providers');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (providerId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('saved_providers')
        .delete()
        .eq('user_id', user?.id)
        .eq('provider_id', providerId);

      if (deleteError) throw deleteError;

      setSavedProviders(prev => prev.filter(provider => provider.id !== providerId));
    } catch (err) {
      console.error('Error removing provider:', err);
      setError('Failed to remove provider');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome, {user.email?.split('@')[0]} 👋
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg 
              shadow-md hover:shadow-lg transition-all duration-200 text-gray-700 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* Saved Providers Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">Saved Employees</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : savedProviders.length === 0 ? (
            <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl shadow-md">
              <p className="text-gray-600">No saved employees yet</p>
              <Link to="/services" className="mt-4 inline-block text-blue-500 hover:text-blue-600">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProviders.map(provider => (
                <div
                  key={provider.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg 
                    transition-all duration-200 overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={provider.photo_url || "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?w=800&auto=format&fit=crop&q=60"}
                      alt={provider.full_name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {provider.full_name}
                    </h3>
                    <p className="text-gray-600 mb-2">{provider.profession}</p>
                    <p className="text-gray-500 text-sm mb-4">{provider.location}</p>
                    <div className="flex justify-between items-center">
                      <a
                        href={`tel:${provider.phone}`}
                        className="text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        {provider.phone}
                      </a>
                      <button
                        onClick={() => handleRemove(provider.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 
                          rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}