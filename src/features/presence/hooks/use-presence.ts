import { useEffect, useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProviders';

interface PresenceState {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  online_at: string;
}

export function useUserPresence(projectId: string | undefined) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!projectId || !user) return;

    // Inisialisasi channel WebSocket
    const channel = supabase.channel(`project_presence:${projectId}`, {
      config: { presence: { key: user.id } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const transformed: PresenceState[] = Object.values(state)
          .flat()
          .map((presence: any) => presence)
          .filter((v, i, a) => a.findIndex((t) => t.user_id === v.user_id) === i);

        setOnlineUsers(transformed);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track data ke dalam memory Realtime
          // Ambil data dari auth metadata agar tidak perlu query DB profil
          await channel.track({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [projectId, user]);

  return onlineUsers;
}
