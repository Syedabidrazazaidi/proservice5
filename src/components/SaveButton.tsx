import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SaveButtonProps {
  providerId: string;
}

export default function SaveButton({ providerId }: SaveButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfSaved();
    }
  }, [user, providerId]);

  const checkIfSaved = async () => {
    try {
      const { data } = await supabase
        .from('saved_providers')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider_id', providerId)
        .maybeSingle();
      
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSave = async () => {
    if (!user) {
      alert('Please log in to save providers');
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        await supabase
          .from('saved_providers')
          .delete()
          .eq('user_id', user.id)
          .eq('provider_id', providerId);
      } else {
        await supabase
          .from('saved_providers')
          .insert([
            {
              user_id: user.id,
              provider_id: providerId
            }
          ]);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={isLoading}
      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-500 transition-colors"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isSaved ? 'fill-red-500 text-red-500' : 'fill-none text-current'
        }`}
      />
      <span>Save</span>
    </button>
  );
}