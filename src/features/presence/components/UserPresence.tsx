import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { useUserPresence } from '../hooks/use-presence';
import { Users } from 'lucide-react';

interface UserPresenceProps {
  projectId: string;
}

export function UserPresence({ projectId }: UserPresenceProps) {
  const onlineUsers = useUserPresence(projectId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-slate-500" />
      <div className="flex -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <Tooltip key={user.user_id}>
            <TooltipTrigger asChild>
              <div className="relative cursor-pointer">
                <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="text-xs">
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-green-500">● Online</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              +{onlineUsers.length - 5}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
