import React from 'react';
import { X, Star, Mail, Phone, MapPin, Clock, PhoneCall } from 'lucide-react';
import type { ServiceProvider } from '../lib/supabase';
import SaveButton from './SaveButton';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProfileModalProps {
  provider: ServiceProvider;
  onClose: () => void;
}

export default function ProfileModal({ provider, onClose }: ProfileModalProps) {
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Push a new entry to the history stack when the modal opens
    window.history.pushState(null, '', location.pathname);

    // Handle the back button
    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose, location.pathname]);

  const handleCall = () => {
    window.location.href = `tel:${provider.phone}`;
  };

  const handleClose = () => {
    // Go back in history instead of just closing
    window.history.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile content */}
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="w-full md:w-2/5 h-48 md:h-full relative">
            <img
              src={provider.photo_url || "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?w=800&auto=format&fit=crop&q=60"}
              alt={provider.full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2">
              <SaveButton providerId={provider.id} />
            </div>
          </div>

          {/* Details section */}
          <div className="p-4 md:p-6 w-full md:w-3/5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{provider.full_name}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {provider.profession}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">{provider.experience_years} years of experience</span>
              </div>

              <button
                onClick={handleCall}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm underline">{provider.phone}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{provider.location}</span>
              </div>

              {provider.specialization && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Star className="w-4 h-4 shrink-0" />
                  <span className="text-sm">Specializes in {provider.specialization}</span>
                </div>
              )}

              {provider.availability && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{provider.availability}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={handleCall}
                className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 
                  transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <PhoneCall className="w-4 h-4" />
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}