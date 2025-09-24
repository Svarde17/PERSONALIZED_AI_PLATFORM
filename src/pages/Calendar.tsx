import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Bell,
  Leaf,
  Target,
  Settings
} from "lucide-react";
import { subscribeToNotifications, sendTestNotification } from "@/utils/notifications";

interface Task {
  week: number;
  task: string;
  details: string;
  priority: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  dueDate: string;
}

interface CalendarData {
  farmer: {
    name: string;
    crop: string;
    location: string;
  };
  season: string;
  currentWeek: number;
  calendar: Task[];
  upcomingTasks: Task[];
}

const Calendar = () => {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalendarData();
    fetchNotifications();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
    if (farmer.id) {
      await subscribeToNotifications(farmer.id);
    }
  };

  const handleTestNotification = async () => {
    const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
    if (farmer.id) {
      const success = await sendTestNotification(farmer.id);
      if (success) {
        alert('Test notification sent!');
      }
    }
  };

  const fetchCalendarData = async () => {
    try {
      const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
      if (!farmer.id) return;

      const response = await fetch(`http://localhost:5000/api/calendar/farmer/${farmer.id}`);
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to fetch calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
      if (!farmer.id) return;

      const response = await fetch(`http://localhost:5000/api/calendar/notifications/${farmer.id}`);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markTaskComplete = async (taskWeek: number) => {
    try {
      const farmer = JSON.parse(sessionStorage.getItem("farmer") || '{}');
      await fetch('http://localhost:5000/api/calendar/task/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmerId: farmer.id, taskWeek })
      });
      fetchCalendarData();
    } catch (error) {
      console.error('Failed to mark task complete:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-gradient-to-r from-red-50 to-red-100';
      case 'medium': return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'low': return 'border-l-green-500 bg-gradient-to-r from-green-50 to-green-100';
      default: return 'border-l-gray-500 bg-gradient-to-r from-gray-50 to-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'current': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'upcoming': return <Target className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!calendarData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center">
            <p>Please login to view your crop calendar.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-gray-900">
                Crop Calendar & Workflow
              </h1>
              <p className="text-gray-600">
                Smart weekly planner for {calendarData.farmer.name}'s {calendarData.farmer.crop} crop
              </p>
            </div>
          </div>
          
          {/* Farmer Info Card */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{calendarData.farmer.crop} - {calendarData.season.toUpperCase()} Season</h3>
                  <p className="text-blue-700 text-sm">{calendarData.farmer.location} • Week {calendarData.currentWeek}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {calendarData.calendar.filter(t => t.status === 'completed').length}/{calendarData.calendar.length} Tasks Completed
              </Badge>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calendar Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current & Upcoming Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Priority Tasks This Week
              </h2>
              <div className="space-y-4">
                {calendarData.upcomingTasks.map((task, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-l-4 ${getPriorityColor(task.priority)} shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{task.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{task.task}</h4>
                            {getStatusIcon(task.status)}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.details}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.status === 'current' ? 'default' : 'secondary'}>
                              Week {task.week}
                            </Badge>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                              {task.priority} priority
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {task.status !== 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => markTaskComplete(task.week)}
                          className="ml-4"
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Full Season Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Complete Season Timeline</h2>
              <div className="space-y-3">
                {calendarData.calendar.map((task, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-l-4 ${
                      task.status === 'completed' ? 'border-l-green-500 bg-green-50 opacity-75' :
                      task.status === 'current' ? 'border-l-blue-500 bg-blue-50' :
                      'border-l-gray-300 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{task.icon}</span>
                        <div>
                          <h5 className="font-medium text-sm">Week {task.week}: {task.task}</h5>
                          <p className="text-xs text-gray-600">{task.details}</p>
                        </div>
                      </div>
                      {getStatusIcon(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Smart Reminders
              </h3>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      notification.type === 'urgent' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{notification.icon}</span>
                      <div>
                        <h5 className="font-medium text-sm">{notification.title}</h5>
                        <p className="text-xs text-gray-600">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Settings
              </h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleTestNotification}
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                >
                  🔔 Test Notification
                </Button>
                <p className="text-xs text-gray-600">
                  Get farming reminders in Hindi/Marathi
                </p>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Season Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Tasks</span>
                  <span className="font-semibold">
                    {calendarData.calendar.filter(t => t.status === 'completed').length}/{calendarData.calendar.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(calendarData.calendar.filter(t => t.status === 'completed').length / calendarData.calendar.length) * 100}%` 
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="font-semibold text-blue-600">{calendarData.currentWeek}</div>
                    <div className="text-xs text-blue-500">Current Week</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-semibold text-green-600">{calendarData.calendar.length - calendarData.currentWeek}</div>
                    <div className="text-xs text-green-500">Weeks Left</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Calendar;