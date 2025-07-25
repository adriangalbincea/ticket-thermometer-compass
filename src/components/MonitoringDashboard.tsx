import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, User, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TechnicianData {
  technician: string;
  totalFeedback: number;
  happyCount: number;
  neutralCount: number;
  unhappyCount: number;
  satisfactionRate: number;
  averageResponseTime?: number;
}

export const MonitoringDashboard: React.FC = () => {
  const [technicianData, setTechnicianData] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'satisfaction' | 'total' | 'name'>('satisfaction');
  const { toast } = useToast();

  const loadTechnicianData = async () => {
    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: feedbackData, error } = await supabase
        .from('feedback_submissions')
        .select(`
          feedback_type,
          submitted_at,
          feedback_links!inner(technician)
        `)
        .gte('submitted_at', thirtyDaysAgo.toISOString());

      if (error) {
        console.error('Error fetching feedback data:', error);
        toast({
          title: "Error",
          description: "Failed to load technician data",
          variant: "destructive",
        });
        return;
      }

      // Process data by technician
      const technicianMap = new Map<string, TechnicianData>();

      feedbackData?.forEach((feedback: any) => {
        const technician = feedback.feedback_links.technician;
        const current = technicianMap.get(technician) || {
          technician,
          totalFeedback: 0,
          happyCount: 0,
          neutralCount: 0,
          unhappyCount: 0,
          satisfactionRate: 0,
        };

        current.totalFeedback++;
        switch (feedback.feedback_type) {
          case 'happy':
            current.happyCount++;
            break;
          case 'neutral':
            current.neutralCount++;
            break;
          case 'unhappy':
            current.unhappyCount++;
            break;
        }

        current.satisfactionRate = current.totalFeedback > 0 
          ? Math.round((current.happyCount / current.totalFeedback) * 100)
          : 0;

        technicianMap.set(technician, current);
      });

      setTechnicianData(Array.from(technicianMap.values()));
    } catch (error) {
      console.error('Error loading technician data:', error);
      toast({
        title: "Error",
        description: "Failed to load technician data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicianData();
  }, []);

  const filteredData = technicianData
    .filter(data => 
      data.technician.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'satisfaction':
          return b.satisfactionRate - a.satisfactionRate;
        case 'total':
          return b.totalFeedback - a.totalFeedback;
        case 'name':
          return a.technician.localeCompare(b.technician);
        default:
          return 0;
      }
    });

  const chartData = filteredData.slice(0, 10).map(data => ({
    name: data.technician,
    happy: data.happyCount,
    neutral: data.neutralCount,
    unhappy: data.unhappyCount,
    satisfaction: data.satisfactionRate,
  }));

  const totalStats = technicianData.reduce(
    (acc, data) => ({
      totalFeedback: acc.totalFeedback + data.totalFeedback,
      totalHappy: acc.totalHappy + data.happyCount,
      totalTechnicians: acc.totalTechnicians + 1,
    }),
    { totalFeedback: 0, totalHappy: 0, totalTechnicians: 0 }
  );

  const overallSatisfaction = totalStats.totalFeedback > 0 
    ? Math.round((totalStats.totalHappy / totalStats.totalFeedback) * 100)
    : 0;

  const handleRefresh = () => {
    loadTechnicianData();
    toast({
      title: "Data Refreshed",
      description: "Technician monitoring data has been updated.",
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['Technician', 'Total Feedback', 'Happy', 'Neutral', 'Unhappy', 'Satisfaction Rate'],
      ...filteredData.map(data => [
        data.technician,
        data.totalFeedback,
        data.happyCount,
        data.neutralCount,
        data.unhappyCount,
        `${data.satisfactionRate}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `technician-monitoring-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Technician monitoring data has been exported.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Technicians</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalTechnicians}</div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback (30d)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalFeedback}</div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSatisfaction}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {filteredData.length > 0 ? filteredData[0].technician : 'N/A'}
            </div>
            {filteredData.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {filteredData[0].satisfactionRate}% satisfaction
              </p>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Filters and Technician List */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Technician Performance Details</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search technicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="sm:max-w-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satisfaction">Satisfaction Rate</SelectItem>
                <SelectItem value="total">Total Feedback</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Technician</th>
                  <th className="text-left p-2">Total Feedback</th>
                  <th className="text-left p-2">Happy</th>
                  <th className="text-left p-2">Neutral</th>
                  <th className="text-left p-2">Unhappy</th>
                  <th className="text-left p-2">Satisfaction Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data, index) => (
                  <tr key={data.technician} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{data.technician}</td>
                    <td className="p-2">{data.totalFeedback}</td>
                    <td className="p-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {data.happyCount}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {data.neutralCount}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        {data.unhappyCount}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={data.satisfactionRate >= 80 ? "default" : data.satisfactionRate >= 60 ? "secondary" : "destructive"}
                      >
                        {data.satisfactionRate}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No technician data found for the last 30 days
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};