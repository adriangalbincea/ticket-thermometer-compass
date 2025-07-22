import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Filter, Download, Users, TrendingUp, Clock, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Mock data
const feedbackData = [
  { id: 1, ticketNumber: 'TK-2024-001', technician: 'John Smith', title: 'Network connectivity issue', feedback: 'happy', comment: 'Quick resolution, great service!', date: '2024-01-15', customer: 'Alice Johnson' },
  { id: 2, ticketNumber: 'TK-2024-002', technician: 'Sarah Wilson', title: 'Printer setup assistance', feedback: 'neutral', comment: 'Took longer than expected', date: '2024-01-15', customer: 'Bob Miller' },
  { id: 3, ticketNumber: 'TK-2024-003', technician: 'Mike Davis', title: 'Email configuration', feedback: 'happy', comment: 'Excellent support!', date: '2024-01-14', customer: 'Carol White' },
  { id: 4, ticketNumber: 'TK-2024-004', technician: 'John Smith', title: 'Software installation', feedback: 'bad', comment: 'Multiple attempts needed', date: '2024-01-14', customer: 'David Brown' },
  { id: 5, ticketNumber: 'TK-2024-005', technician: 'Lisa Chen', title: 'Password reset', feedback: 'happy', comment: 'Very helpful and patient', date: '2024-01-13', customer: 'Eve Davis' },
];

const chartData = [
  { name: 'Mon', happy: 12, neutral: 3, bad: 1 },
  { name: 'Tue', happy: 15, neutral: 2, bad: 2 },
  { name: 'Wed', happy: 18, neutral: 4, bad: 1 },
  { name: 'Thu', happy: 14, neutral: 3, bad: 3 },
  { name: 'Fri', happy: 20, neutral: 2, bad: 1 },
  { name: 'Sat', happy: 8, neutral: 1, bad: 0 },
  { name: 'Sun', happy: 5, neutral: 1, bad: 1 },
];

const pieData = [
  { name: 'Happy', value: 92, color: 'hsl(var(--feedback-happy))' },
  { name: 'Neutral', value: 16, color: 'hsl(var(--feedback-neutral))' },
  { name: 'Bad', value: 9, color: 'hsl(var(--feedback-bad))' },
];

const trendData = [
  { month: 'Sep', satisfaction: 88 },
  { month: 'Oct', satisfaction: 85 },
  { month: 'Nov', satisfaction: 92 },
  { month: 'Dec', satisfaction: 89 },
  { month: 'Jan', satisfaction: 94 },
];

export const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const filteredData = feedbackData.filter(item => {
    const matchesSearch = item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTechnician = selectedTechnician === 'all' || item.technician === selectedTechnician;
    const matchesFeedback = selectedFeedback === 'all' || item.feedback === selectedFeedback;
    
    return matchesSearch && matchesTechnician && matchesFeedback;
  });

  const getFeedbackBadge = (feedback: string) => {
    const variants = {
      happy: 'bg-feedback-happy text-feedback-happy-foreground',
      neutral: 'bg-feedback-neutral text-feedback-neutral-foreground',
      bad: 'bg-feedback-bad text-feedback-bad-foreground'
    };
    return variants[feedback as keyof typeof variants] || '';
  };

  const totalFeedback = feedbackData.length;
  const happyCount = feedbackData.filter(f => f.feedback === 'happy').length;
  const satisfactionRate = Math.round((happyCount / totalFeedback) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Feedback Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze customer satisfaction</p>
        </div>
        <Button className="bg-gradient-primary">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-feedback-happy">{satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">-0.3h from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-feedback-happy">↗ +8%</div>
            <p className="text-xs text-muted-foreground">Improving satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Weekly Feedback Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="happy" fill="hsl(var(--feedback-happy))" />
                <Bar dataKey="neutral" fill="hsl(var(--feedback-neutral))" />
                <Bar dataKey="bad" fill="hsl(var(--feedback-bad))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Feedback Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Trend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Satisfaction Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="satisfaction" 
                stroke="hsl(var(--feedback-happy))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--feedback-happy))", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Feedback Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              placeholder="Search tickets, technicians, or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                <SelectItem value="John Smith">John Smith</SelectItem>
                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                <SelectItem value="Mike Davis">Mike Davis</SelectItem>
                <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFeedback} onValueChange={setSelectedFeedback}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="bad">Bad</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.ticketNumber}</TableCell>
                    <TableCell>{item.customer}</TableCell>
                    <TableCell>{item.technician}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>
                      <Badge className={getFeedbackBadge(item.feedback)}>
                        {item.feedback}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.comment}</TableCell>
                    <TableCell>{item.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};