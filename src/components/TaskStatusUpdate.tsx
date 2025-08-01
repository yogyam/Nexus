import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskStatusUpdateProps {
  taskId: string;
  currentStatus: 'To Do' | 'In Progress' | 'Done';
  onStatusChange: (newStatus: 'To Do' | 'In Progress' | 'Done') => void;
}

export const TaskStatusUpdate = ({ taskId, currentStatus, onStatusChange }: TaskStatusUpdateProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: 'To Do' | 'In Progress' | 'Done') => {
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      onStatusChange(newStatus);
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select 
      value={currentStatus} 
      onValueChange={(value: 'To Do' | 'In Progress' | 'Done') => handleStatusChange(value)}
      disabled={loading}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="To Do">To Do</SelectItem>
        <SelectItem value="In Progress">In Progress</SelectItem>
        <SelectItem value="Done">Done</SelectItem>
      </SelectContent>
    </Select>
  );
}; 