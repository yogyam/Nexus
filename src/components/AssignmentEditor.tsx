import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, FileText } from 'lucide-react';

interface AssignmentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  currentAssignment: string;
  onAssignmentUpdated: (newAssignment: string) => void;
}

export const AssignmentEditor = ({ 
  open, 
  onOpenChange, 
  projectId, 
  projectTitle, 
  currentAssignment,
  onAssignmentUpdated 
}: AssignmentEditorProps) => {
  const [assignmentText, setAssignmentText] = useState(currentAssignment);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAssignmentText(currentAssignment);
  }, [currentAssignment]);

  const handleSave = async () => {
    if (!assignmentText.trim()) {
      toast({
        title: "Error",
        description: "Assignment text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ assignment_text: assignmentText.trim() })
        .eq('id', projectId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });

      onAssignmentUpdated(assignmentText.trim());
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAssignmentText(currentAssignment);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Assignment: {projectTitle}
          </DialogTitle>
          <DialogDescription>
            Update the assignment text for this project. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="assignment-text">Assignment Text</Label>
            <Textarea
              id="assignment-text"
              placeholder="Enter the assignment text here..."
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              rows={12}
              className="resize-none font-mono text-sm"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{assignmentText.length} characters</span>
              <span>{assignmentText.split('\n').length} lines</span>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving || !assignmentText.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Assignment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 