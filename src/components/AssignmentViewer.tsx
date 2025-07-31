import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignmentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentText: string;
  projectTitle: string;
}

export const AssignmentViewer = ({ open, onOpenChange, assignmentText, projectTitle }: AssignmentViewerProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assignmentText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Assignment text copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy assignment text",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assignment: {projectTitle}</DialogTitle>
          <DialogDescription>
            View and copy the assignment text for this project
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Assignment Text</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          
          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground">
              {assignmentText}
            </pre>
          </ScrollArea>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 