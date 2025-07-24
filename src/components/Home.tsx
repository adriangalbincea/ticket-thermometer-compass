import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, BarChart3, Settings, Star, Users, TrendingUp, Globe } from 'lucide-react';

export const Home = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Customer Thermometer
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Collect, analyze, and act on customer feedback with our comprehensive thermometer system. 
          Get instant insights into customer satisfaction across your support tickets.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-card hover:shadow-feedback transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-feedback-happy" />
              Simple Feedback Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              One-click feedback with happy, neutral, and bad options. 
              Auto-populated ticket information from webhooks.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-feedback transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-feedback-neutral" />
              Comprehensive Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Advanced filtering, trend analysis, and satisfaction metrics. 
              Export reports and track performance over time.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-feedback transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-feedback-bad" />
              Easy Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Webhook support, email notifications, and database integration. 
              Secure authentication and role management.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-feedback-happy" />
                Customer Experience
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• One-click smiley face feedback (Bad, Neutral, Happy)</li>
                <li>• Auto-populated ticket information via webhooks</li>
                <li>• Optional comment field for detailed feedback</li>
                <li>• Mobile-responsive design</li>
                <li>• Fast loading and simple interface</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-feedback-neutral" />
                Multi-User Administration
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Role-based access control</li>
                <li>• Technician performance tracking</li>
                <li>• Team satisfaction metrics</li>
                <li>• Departmental filtering and reports</li>
                <li>• User management interface</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-feedback-happy" />
                Advanced Analytics
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Real-time satisfaction trends</li>
                <li>• Filtering by date, technician, ticket type</li>
                <li>• Comprehensive statistical reports</li>
                <li>• Export functionality (PDF, CSV, Excel)</li>
                <li>• Custom dashboard widgets</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-feedback-bad" />
                Enterprise Features
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• HTTPS security with SSL certificates</li>
                <li>• PostgreSQL database integration</li>
                <li>• Webhook endpoints for ticket systems</li>
                <li>• Secure link generation with expiry</li>
                <li>• API endpoints for integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Demo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-elegant text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-feedback-happy mb-2">94%</div>
            <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            <Badge className="mt-2 bg-feedback-happy text-feedback-happy-foreground">+5%</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-elegant text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-foreground mb-2">1,247</div>
            <p className="text-sm text-muted-foreground">Total Responses</p>
            <Badge className="mt-2">This Month</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-elegant text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-feedback-neutral mb-2">2.4h</div>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
            <Badge variant="outline" className="mt-2">Improved</Badge>
          </CardContent>
        </Card>

        <Card className="shadow-elegant text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-feedback-bad mb-2">12</div>
            <p className="text-sm text-muted-foreground">Active Technicians</p>
            <Badge variant="secondary" className="mt-2">Team</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};