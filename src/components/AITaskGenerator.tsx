import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { geminiClient, GeminiTask } from '@/integrations/gemini/client';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { Bot, Sparkles, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface AITaskGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  teamSize: number;
  onTasksGenerated: () => void;
}

export const AITaskGenerator = ({ 
  open, 
  onOpenChange, 
  projectId, 
  projectTitle, 
  teamSize,
  onTasksGenerated 
}: AITaskGeneratorProps) => {
  const [assignmentText, setAssignmentText] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<GeminiTask[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateTasks = async () => {
    if (!assignmentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter the assignment text",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await geminiClient.generateTasksFromAssignment(
        assignmentText,
        teamSize,
        projectTitle
      );

      setGeneratedTasks(response.tasks);
      setTotalHours(response.totalEstimatedHours);
      setRecommendations(response.recommendations);

      toast({
        title: "Success",
        description: `Generated ${response.tasks.length} tasks for your team`,
      });
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTasksInDatabase = async () => {
    if (generatedTasks.length === 0) return;

    setCreatingTasks(true);
    try {
      // Get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Create tasks in database
      const taskInserts = generatedTasks.map(task => ({
        project_id: projectId,
        title: task.title,
        description: task.description,
        status: 'To Do' as const,
        assigned_to: null, // Will be assigned later
        due_date: null, // Will be set based on estimated hours
      }));

      const { error: insertError } = await supabase
        .from('tasks')
        .insert(taskInserts);

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: `Created ${generatedTasks.length} tasks in your project`,
      });

      onTasksGenerated();
      onOpenChange(false);
      
      // Reset form
      setAssignmentText('');
      setGeneratedTasks([]);
      setTotalHours(0);
      setRecommendations([]);
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast({
        title: "Error",
        description: "Failed to create tasks in database",
        variant: "destructive",
      });
    } finally {
      setCreatingTasks(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Task Generator
          </DialogTitle>
          <DialogDescription>
            Use AI to automatically break down your assignment into manageable tasks for your team of {teamSize} people.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assignment Input */}
          <div className="space-y-4">
            <Label htmlFor="assignment-text">Assignment Text</Label>
            <Textarea
              id="assignment-text"
              placeholder="Paste your assignment text here..."
              value={assignmentText}
              onChange={(e) => setAssignmentText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <Button 
              onClick={generateTasks} 
              disabled={loading || !assignmentText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Tasks with AI
                </>
              )}
            </Button>
          </div>

          {/* Generated Tasks */}
          {generatedTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Generated Tasks ({generatedTasks.length})</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {totalHours} hours total
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button disabled={creatingTasks}>
                        {creatingTasks ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Create All Tasks
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Create Tasks</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will create {generatedTasks.length} tasks in your project. You can edit them later to assign team members and set due dates.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={createTasksInDatabase}>
                          Create Tasks
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {generatedTasks.map((task, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary">
                            {task.estimatedHours}h
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="h-3 w-3" />
                          Depends on: {task.dependencies.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 text-sm">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 