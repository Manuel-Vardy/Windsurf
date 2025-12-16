import React from 'react';
import { CANTEEN_FEE } from '@/data/mockData';
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Banknote, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  onClassClick: (classId: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onClassClick }) => {
  const { classes, getClassTotalAmount, getWeeklyTotals, weeks } = useSchool();

  const totalStudents = classes.reduce((sum, c) => sum + c.students.length, 0);
  const totalAmount = classes.reduce((sum, c) => sum + getClassTotalAmount(c.id), 0);

  // Weekly chart data
  const weeklyChartData = [];
  const maxWeeks = Math.max(...classes.map(c => (weeks[c.id] || []).length));
  
  for (let i = 0; i < maxWeeks; i++) {
    const weekData: { [key: string]: number | string } = { name: `Week ${i + 1}` };
    classes.forEach(c => {
      const weeklyTotals = getWeeklyTotals(c.id);
      weekData[c.name] = weeklyTotals[i] || 0;
    });
    weeklyChartData.push(weekData);
  }

  // Monthly chart data (simulated)
  const monthlyChartData = [
    { name: 'Month 1', total: Math.round(totalAmount * 0.3) },
    { name: 'Month 2', total: Math.round(totalAmount * 0.4) },
    { name: 'Month 3', total: Math.round(totalAmount * 0.3) },
  ];

  // Yearly chart data (simulated)
  const yearlyChartData = [
    { name: 'Term 1', total: Math.round(totalAmount * 0.35) },
    { name: 'Term 2', total: Math.round(totalAmount * 0.35) },
    { name: 'Term 3', total: Math.round(totalAmount * 0.30) },
  ];

  const colors = ['#4361ee', '#3a86ff', '#4cc9f0', '#7209b7', '#f72585', '#4895ef'];

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="card-shadow hover:card-shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-school-success/20 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-school-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collection</p>
                <p className="text-2xl font-bold text-foreground">GH₵ {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-school-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-school-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Fee</p>
                <p className="text-2xl font-bold text-foreground">GH₵ {CANTEEN_FEE}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow hover:card-shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-school-warning/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-school-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-foreground">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Summary Cards */}
      <h2 className="text-xl font-semibold text-foreground mb-4">Class Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {classes.map((classInfo, index) => (
          <Card 
            key={classInfo.id} 
            className="card-shadow hover:card-shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
            onClick={() => onClassClick(classInfo.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{classInfo.name}</span>
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
              </CardTitle>
              <p className="text-sm text-muted-foreground">{classInfo.tutor}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-xl font-semibold text-foreground">{classInfo.students.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Collected</p>
                  <p className="text-xl font-semibold text-school-success">
                    GH₵ {getClassTotalAmount(classInfo.id).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Weekly Collection by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  {classes.map((c, i) => (
                    <Bar 
                      key={c.id} 
                      dataKey={c.name} 
                      fill={colors[i % colors.length]} 
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Chart */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Monthly Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="total" fill="#4361ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Chart */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Yearly Collection (Per Term)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="total" fill="#3a86ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
