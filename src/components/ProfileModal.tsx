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
    window.history.pushState(null, '', location.pathname);

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
    window.history.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm 
            hover:bg-white transition-colors z-10 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image container */}
          <div className="relative h-72 md:h-[400px]">
            <img
              src={provider.photo_url || "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?w=800&auto=format&fit=crop&q=60"}
              alt={provider.full_name}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute top-4 right-4">
              <SaveButton providerId={provider.id} />
            </div>
            {/* Gradient overlay for mobile */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            <div className="absolute bottom-4 left-4 right-4 md:hidden">
              <h2 className="text-xl font-bold text-white mb-1">{provider.full_name}</h2>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                {provider.profession}
              </span>
            </div>
          </div>

          {/* Details section */}
          <div className="p-6 flex flex-col">
            {/* Hide on mobile as it's shown over the image */}
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{provider.full_name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {provider.profession}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>{provider.experience_years} years of experience</span>
              </div>

              <button
                onClick={handleCall}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
                <span className="underline">{provider.phone}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{provider.location}</span>
              </div>

              {provider.specialization && (
                <div className="flex items-start gap-2 text-gray-600">
                  <Star className="w-5 h-5 shrink-0" />
                  <span>Specializes in {provider.specialization}</span>
                </div>
              )}

              {provider.availability && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{provider.availability}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={handleCall}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 
                  transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <PhoneCall className="w-5 h-5" />
                Call Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}