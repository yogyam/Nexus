import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Users, Calendar, CheckCircle, Circle, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TaskForm } from '@/components/TaskForm';
import { AssignmentViewer } from '@/components/AssignmentViewer';
import { Logo } from '@/components/Logo';
import { Navigation } from '@/components/Navigation';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'To Do' | 'In Progress' | 'Done';
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  assignment_text: string | null;
  owner_id: string;
  created_at: string;
}

const Project = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showAssignmentViewer, setShowAssignmentViewer] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && id) {
      fetchProjectData();
    }
  }, [user, authLoading, id, navigate]);

  const fetchProjectData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      
      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      setProject(projectData);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />
      
      {/* Project Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{project.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {project.owner_id === user?.id ? 'Owner' : 'Member'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {project.assignment_text && (
                <Button 
                  variant="outline" 
                  onClick={() => setShowAssignmentViewer(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Assignment
                </Button>
              )}
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {project.description && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Tasks</h2>
          <div className="text-sm text-muted-foreground">
            {tasks.length} total tasks
          </div>
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first task to start organizing your project
            </p>
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          {task.due_date && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Due {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        projectId={id!}
        onSuccess={() => {
          fetchProjectData();
          setShowTaskForm(false);
        }}
      />
      
      {project.assignment_text && (
        <AssignmentViewer
          open={showAssignmentViewer}
          onOpenChange={setShowAssignmentViewer}
          assignmentText={project.assignment_text}
          projectTitle={project.title}
        />
      )}
    </div>
  );
};

export default Project;