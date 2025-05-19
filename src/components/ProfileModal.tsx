import React from 'react';
import { X, Star, Mail, Phone, MapPin, Clock, PhoneCall } from 'lucide-react';
import type { ServiceProvider } from '../lib/supabase';
import SaveButton from './SaveButton';

interface ProfileModalProps {
  provider: ServiceProvider;
  onClose: () => void;
}

export default function ProfileModal({ provider, onClose }: ProfileModalProps) {
  const handleCall = () => {
    window.location.href = `tel:${provider.phone}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Profile content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Image section */}
          <div className="h-64 md:h-full relative">
            <img
              src={provider.photo_url || "https://images.unsplash.com/photo-1587778082149-bd5b1bf5d3fa?w=800&auto=format&fit=crop&q=60"}
              alt={provider.full_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <SaveButton providerId={provider.id} />
            </div>
          </div>

          {/* Details section */}
          <div className="p-6 pr-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{provider.full_name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {provider.profession}
              </span>
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

            <div className="mt-6 space-y-4">
              <button
                onClick={handleCall}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
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