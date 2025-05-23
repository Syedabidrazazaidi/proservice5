import React, { useState, useEffect } from 'react';
import { Search, Zap, Droplets, Hammer, Star, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ServiceProvider } from '../lib/supabase';
import SaveButton from '../components/SaveButton';
import ProfileModal from '../components/ProfileModal';
import worker8 from './worker8.jpg';
import worker2 from './worker2.jpg';
import worker7 from './worker7.jpg';

const backgroundImages = [
  {
    url: worker8,
    description: "Find trusted local service providers in Bhopal - Electricians, Plumbers, and more"
  },
  {
    url: worker7,
    description: "Professional home services and repairs in Bhopal"
  },
  {
    url: worker2,
    description: "Expert technicians and service providers in Bhopal"
  }
];

const getServiceIcon = (profession: string) => {
  switch (profession) {
    case "Electrical Services":
      return <Zap className="w-6 h-6" />;
    case "Plumbing":
      return <Droplets className="w-6 h-6" />;
    case "Carpentry":
      return <Hammer className="w-6 h-6" />;
    default:
      return <Wrench className="w-6 h-6" />;
  }
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [workers, setWorkers] = useState<ServiceProvider[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('service_providers')
          .select('profession');

        if (fetchError) {
          console.error('Error fetching professions:', fetchError);
          setError('Failed to fetch professions. Please try again later.');
          return;
        }

        if (!data) {
          setError('No data received from the server');
          return;
        }

        const uniqueProfessions = Array.from(new Set(data.map(item => item.profession))).sort();
        setProfessions(uniqueProfessions);
      } catch (err) {
        console.error('Error in fetchProfessions:', err);
        setError('An unexpected error occurred. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfessions();
  }, []);

  useEffect(() => {
    const searchWorkers = async () => {
      if (!searchTerm && !selectedProfession) {
        setWorkers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('service_providers')
          .select('*');

        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,` +
            `profession.ilike.%${searchTerm}%,` +
            `specialization.ilike.%${searchTerm}%`
          );
        }

        if (selectedProfession) {
          query = query.eq('profession', selectedProfession);
        }

        const { data, error: searchError } = await query;

        if (searchError) {
          throw searchError;
        }

        setWorkers(data || []);
      } catch (err) {
        console.error('Error searching workers:', err);
        setError('Failed to search service providers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchWorkers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedProfession]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      const matchedSuggestions = professions.filter(
        item => item.toLowerCase().includes(searchLower)
      );
      setSuggestions(matchedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm, professions]);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Background */}
      <div 
        className="relative h-screen flex flex-col"
        style={{
         backgroundImage: `url("${backgroundImages[currentBgIndex].url}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        
        <div className="relative flex-grow flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Expert Professionals</h2>
            <p className="text-xl text-white/90">{backgroundImages[currentBgIndex].description}</p>
          </div>

          {/* Search Section */}
          <div className="w-full max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                searchTerm ? 'text-blue-500' : isSearchFocused ? 'text-white' : 'text-white/70'
              }`} />
              <input
                type="text"
                placeholder="Search by service or specialization..."
                className={`w-full pl-10 pr-4 py-3 rounded-full transition-all duration-300
                  bg-white/10 backdrop-blur-sm border border-white/30 text-white placeholder-white/70
                  focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/50
                  hover:bg-white/15 hover:border-white/40 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]
                  ${isSearchFocused ? 'shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white/15' : ''}
                `}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setIsSearchFocused(false);
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white/10 backdrop-blur-md rounded-lg 
                  shadow-[0_0_15px_rgba(255,255,255,0.2)] border border-white/30 max-h-60 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-4 py-2 hover:bg-white/20 transition-all duration-200 
                        flex items-center space-x-2 text-white first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="w-4 h-4" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap justify-center">
              {professions.map(profession => (
                <button
                  key={profession}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedProfession === profession
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'border border-white/30 text-white hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                  }`}
                  onClick={() => setSelectedProfession(selectedProfession === profession ? null : profession)}
                >
                  {profession}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {(searchTerm || selectedProfession) && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="text-white text-center">
              <p className="text-sm mb-2">Scroll to see results</p>
              <div className="w-6 h-6 border-2 border-white rounded-full relative">
                <div className="absolute top-1 left-1/2 w-1 h-2 bg-white rounded-full transform -translate-x-1/2" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {(searchTerm || selectedProfession) && (
        <div className="bg-gray-100 min-h-screen py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Error Message */}
            {error && (
              <div className="text-center py-4 px-6 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-8">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : workers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {workers.map(worker => (
                  <div 
                    key={worker.id} 
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl 
                      transition-all transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelectedProvider(worker)}
                  >
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={worker.photo_url || "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?w=800&auto=format&fit=crop&q=60"} 
                        alt={worker.full_name}
                        className="w-full h-full object-cover transition-transform hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getServiceIcon(worker.profession)}
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{worker.profession}</span>
                        </div>
                        <div onClick={e => e.stopPropagation()}>
                          <SaveButton providerId={worker.id} />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{worker.full_name}</h3>
                      <p className="text-gray-600 mb-2">{worker.experience_years} years experience</p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Age:</span> {worker.age} years
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Phone:</span> {worker.phone}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        <span className="font-medium">Location:</span> {worker.location}
                      </p>
                      {worker.specialization && (
                        <p className="text-sm text-gray-500 mb-1">
                          <span className="font-medium">Specialization:</span> {worker.specialization}
                        </p>
                      )}
                      {worker.availability && (
                        <p className="text-sm text-gray-500 mb-4">
                          <span className="font-medium">Availability:</span> {worker.availability}
                        </p>
                      )}
                      <button 
                        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 
                          transition-colors shadow-md hover:shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(worker.phone);
                        }}
                      >
                        Contact Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No service providers found. Try a different search term or category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedProvider && (
        <ProfileModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}