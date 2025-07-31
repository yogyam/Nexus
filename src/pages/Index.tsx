import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Upload } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Logo } from '@/components/Logo';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Remove automatic redirect - let users see the landing page even when logged in
  // useEffect(() => {
  //   if (!loading && user) {
  //     navigate('/dashboard');
  //   }
  // }, [user, loading, navigate]);

  const features = [
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your classmates on group projects"
    },
    {
      icon: Calendar,
      title: "Task Management",
      description: "Track progress with organized task boards and deadlines"
    },
    {
      icon: CheckSquare,
      title: "Project Organization",
      description: "Keep all your group projects organized in one place"
    },
    {
      icon: Upload,
      title: "File Sharing",
      description: "Upload and share rubrics and project files securely"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Student Collaboration Platform</span>
                </div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Collaborate on</span>{' '}
                  <span className="block bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent xl:inline">student projects</span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 sm:mt-8 sm:text-xl sm:max-w-xl sm:mx-auto md:mt-8 md:text-2xl lg:mx-0 leading-relaxed">
                  Nexus helps student teams organize their group projects, manage tasks, 
                  and collaborate effectively. Get your assignments done together with ease.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                  {user ? (
                    <Button 
                      size="lg" 
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        onClick={() => navigate('/auth')}
                        className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Get Started Free
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => navigate('/auth')}
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-200"
                      >
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Stats */}
                <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">1000+</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-600">500+</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">Features</span>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"></div>
            </div>
            <h2 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for group projects
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 lg:mx-auto">
              Built specifically for student teams to collaborate effectively on academic projects.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardHeader className="pb-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500">
        <div className="max-w-4xl mx-auto text-center py-20 px-4 sm:py-24 sm:px-6 lg:px-8">
          {user ? (
            <>
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                <span className="block">Welcome back!</span>
                <span className="block">Ready to continue collaborating?</span>
              </h2>
              <p className="mt-6 text-xl leading-8 text-blue-100">
                Access your projects and continue working with your team.
              </p>
              <Button
                size="lg"
                className="mt-10 bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                <span className="block">Ready to collaborate?</span>
                <span className="block">Start your first project today.</span>
              </h2>
              <p className="mt-6 text-xl leading-8 text-blue-100">
                Join thousands of students already using Nexus for their group projects.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate('/auth')}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200"
                  onClick={() => navigate('/auth')}
                >
                  Learn More
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
