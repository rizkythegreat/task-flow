import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import {
  useProjectMembers,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember
} from '@/features/members';
import { useAuth } from '@/app/providers/AuthProviders';
import { useIsAdmin } from '@/shared/hooks/use-permission';
import type { UserRole } from '@/shared/types';
import { USER_ROLES } from '@/shared/types';
import { toast } from 'sonner';
import { Loader2, UserPlus, Trash2, Crown } from 'lucide-react';

interface MembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function MembersModal({ open, onOpenChange, projectId }: MembersModalProps) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { user } = useAuth();
  const isAdmin = useIsAdmin(projectId);
  const { data: members, isLoading } = useProjectMembers(projectId);
  const inviteMember = useInviteMember();
  const updateRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500 text-white';
      case 'editor':
        return 'bg-blue-500 text-white';
      case 'viewer':
        return 'bg-slate-500 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      await inviteMember.mutateAsync({
        projectId,
        email: email.trim(),
        role: selectedRole
      });
      toast.success('Member invited successfully');
      setEmail('');
      setSelectedRole('viewer');
      setShowInviteForm(false);
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast.error(error.message || 'Failed to invite member');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UserRole) => {
    try {
      await updateRole.mutateAsync({
        memberId,
        projectId,
        role: newRole
      });
      toast.success('Member role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update member role');
    }
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;

    try {
      await removeMember.mutateAsync({ memberId, projectId });
      toast.success('Member removed from project');
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 bg-card dark:bg-card max-w-100 rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Project Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite Form */}
          {isAdmin && (
            <div className="border-b pb-4">
              {!showInviteForm ? (
                <Button
                  onClick={() => setShowInviteForm(true)}
                  variant="outline"
                  className="w-full">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              ) : (
                <form onSubmit={handleInvite} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                      disabled={inviteMember.isPending}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value as UserRole)}
                      disabled={inviteMember.isPending}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowInviteForm(false);
                        setEmail('');
                        setSelectedRole('viewer');
                      }}
                      disabled={inviteMember.isPending}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={inviteMember.isPending} className="flex-1">
                      {inviteMember.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Invite
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm text-slate-700 dark:text-slate-300">
              Members ({members?.length || 0})
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-2 max-h-100 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/20">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.profile.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(member.profile.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{member.profile.full_name}</p>
                          {member.profile.id === user?.id && (
                            <span className="text-xs text-slate-500">(You)</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{member.profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && member.profile.id !== user?.id ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) => handleRoleChange(member.id, value as UserRole)}
                          disabled={updateRole.isPending}>
                          <SelectTrigger className="sm:w-27.5 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      )}

                      {isAdmin && member.profile.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(member.id, member.profile.full_name)}
                          disabled={removeMember.isPending}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 text-sm py-8">No members yet</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
