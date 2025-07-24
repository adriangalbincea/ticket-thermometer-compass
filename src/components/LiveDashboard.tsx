import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Filter, Download, Users, TrendingUp, Clock, Star, RefreshCw, CalendarIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  id: string;
  ticket_number: string;
  technician: string;
  ticket_title: string;
  feedback_type: 'happy' | 'neutral' | 'bad';
  comment: string | null;
  submitted_at: string;
  customer_name?: string;
  customer_email?: string;
}

export const LiveDashboard: React.FC = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  const loadFeedbackData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select(`
          id,
          feedback_type,
          comment,
          submitted_at,
          feedback_links (
            ticket_number,
            technician,
            ticket_title,
            customer_name,
            customer_email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load feedback data: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our interface
      const transformedData: FeedbackData[] = data.map(item => ({
        id: item.id,
        ticket_number: item.feedback_links?.ticket_number || 'N/A',
        technician: item.feedback_links?.technician || 'N/A',
        ticket_title: item.feedback_links?.ticket_title || 'N/A',
        feedback_type: item.feedback_type as 'happy' | 'neutral' | 'bad',
        comment: item.comment,
        submitted_at: item.submitted_at,
        customer_name: item.feedback_links?.customer_name || undefined,
        customer_email: item.feedback_links?.customer_email || undefined,
      }));

      setFeedbackData(transformedData);
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const filteredData = feedbackData.filter(item => {
    const matchesSearch = item.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ticket_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTechnician = selectedTechnician === 'all' || item.technician === selectedTechnician;
    const matchesFeedback = selectedFeedback === 'all' || item.feedback_type === selectedFeedback;
    
    // Date filtering
    const itemDate = new Date(item.submitted_at);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === 'today') {
      matchesDate = itemDate.toDateString() === now.toDateString();
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = itemDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = itemDate >= monthAgo;
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      matchesDate = itemDate >= yearAgo;
    } else if (dateFilter === 'custom' && customDateRange?.from) {
      const fromDate = customDateRange.from;
      const toDate = customDateRange.to || now;
      matchesDate = itemDate >= fromDate && itemDate <= toDate;
    }
    
    return matchesSearch && matchesTechnician && matchesFeedback && matchesDate;
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
  const unhappyCount = feedbackData.filter(f => f.feedback_type === 'bad').length;
  const happyCount = feedbackData.filter(f => f.feedback_type === 'happy').length;
  const satisfactionRate = totalFeedback > 0 ? Math.round((happyCount / totalFeedback) * 100) : 0;

  // Get unique technicians for filter
  const uniqueTechnicians = [...new Set(feedbackData.map(f => f.technician))].filter(t => t !== 'N/A');

  // Generate chart data
  const chartData = ['happy', 'neutral', 'bad'].map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: feedbackData.filter(f => f.feedback_type === type).length
  }));

  const pieData = chartData.map((item, index) => ({
    ...item,
    color: ['hsl(var(--feedback-happy))', 'hsl(var(--feedback-neutral))', 'hsl(var(--feedback-bad))'][index]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Feedback Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time customer satisfaction monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadFeedbackData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-primary" 
            size="sm"
            onClick={() => {
              const csvData = filteredData.map(item => ({
                'Ticket Number': item.ticket_number,
                'Customer': item.customer_name || 'Anonymous',
                'Technician': item.technician,
                'Issue': item.ticket_title,
                'Feedback': item.feedback_type,
                'Comment': item.comment || 'No comment',
                'Date': new Date(item.submitted_at).toLocaleDateString()
              }));
              
              const headers = Object.keys(csvData[0] || {});
              const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
              ].join('\n');
              
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'feedback-export.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-elegant cursor-pointer hover:shadow-card transition-shadow duration-200" onClick={() => {
          setSelectedFeedback('all');
          setSelectedTechnician('all');
          toast({
            title: "Filters Cleared",
            description: "Showing all feedback responses",
          });
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeedback}</div>
            <p className="text-xs text-muted-foreground">All time responses</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant cursor-pointer hover:shadow-card transition-shadow duration-200" onClick={() => {
          setSelectedFeedback('happy');
          toast({
            title: "Filter Applied",
            description: `Showing Happy feedback only (${satisfactionRate}% satisfaction rate)`,
          });
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-feedback-happy">{satisfactionRate}%</div>
            <p className="text-xs text-muted-foreground">Happy customers</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant cursor-pointer hover:shadow-card transition-shadow duration-200" onClick={() => {
          setSelectedFeedback('bad');
          toast({
            title: "Filter Applied",
            description: `Showing Unhappy feedback only`,
          });
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unhappy Responses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-feedback-bad">{unhappyCount}</div>
            <p className="text-xs text-muted-foreground">Negative feedback</p>
          </CardContent>
        </Card>

        <Card className="shadow-elegant cursor-pointer hover:shadow-card transition-shadow duration-200" onClick={() => {
          setSelectedFeedback('all');
          setSelectedTechnician('all');
          toast({
            title: "Filters Cleared",
            description: `Showing all feedback from ${uniqueTechnicians.length} technicians`,
          });
        }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technicians</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTechnicians.length}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {totalFeedback > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">Click on bars to filter feedback</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))"
                    cursor="pointer"
                    onClick={(data) => {
                      if (data) {
                        const feedbackType = data.name.toLowerCase();
                        setSelectedFeedback(feedbackType);
                        toast({
                          title: "Filter Applied",
                          description: `Showing ${data.name} feedback only`,
                        });
                      }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Satisfaction Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">Click on slices to filter feedback</p>
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
                    cursor="pointer"
                    onClick={(data) => {
                      if (data) {
                        const feedbackType = data.name.toLowerCase();
                        setSelectedFeedback(feedbackType);
                        toast({
                          title: "Filter Applied",
                          description: `Showing ${data.name} feedback only`,
                        });
                      }
                    }}
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
      )}

      {/* Feedback Records - Moved to top */}
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
                {uniqueTechnicians.map(tech => (
                  <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                ))}
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
            
            {selectedFeedback !== 'all' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedFeedback('all');
                  toast({
                    title: "Filter Cleared",
                    description: "Showing all feedback types",
                  });
                }}
              >
                Clear Filter
              </Button>
            )}

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateFilter === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-60 justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange?.from ? (
                      customDateRange.to ? (
                        <>
                          {format(customDateRange.from, "LLL dd, y")} -{" "}
                          {format(customDateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(customDateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={customDateRange?.from}
                    selected={customDateRange}
                    onSelect={setCustomDateRange}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {totalFeedback === 0 ? "No feedback submitted yet" : "No feedback matches your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.ticket_number}</TableCell>
                      <TableCell>{item.customer_name || 'Anonymous'}</TableCell>
                      <TableCell>{item.customer_email || 'N/A'}</TableCell>
                      <TableCell>{item.technician}</TableCell>
                      <TableCell>{item.ticket_title}</TableCell>
                      <TableCell>
                        <Badge className={getFeedbackBadge(item.feedback_type)}>
                          {item.feedback_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.comment || 'No comment'}</TableCell>
                      <TableCell>{new Date(item.submitted_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};