import React, { useMemo, useState } from 'react';
import { CANTEEN_FEE } from '@/data/mockData';
import { useSchool } from '@/contexts/SchoolContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, EyeOff, Banknote, Users, GraduationCap, UserPlus, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const ClassView: React.FC = () => {
  const { 
    classes,
    selectedClass, 
    weeks, 
    addWeek, 
    addStudent,
    getClassStudentsForWeek,
    togglePayment, 
    getStudentWeeklyTotal,
    getClassWeeklyTotal,
    getClassTotalAmount,
    getWeeklyTotals,
    compactView,
    setCompactView
  } = useSchool();

  const classInfo = classes.find(c => c.id === selectedClass);
  const classWeeks = weeks[selectedClass] || [];
  const weeklyTotals = getWeeklyTotals(selectedClass);

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentGender, setStudentGender] = useState<'Male' | 'Female'>('Male');
  const [studentAge, setStudentAge] = useState<string>('');
  const [studentParentPhone, setStudentParentPhone] = useState('');
  const [studentPhotoUrl, setStudentPhotoUrl] = useState('');
  const [studentStartWeekNumber, setStudentStartWeekNumber] = useState<string>('1');
  const [jumpWeekNumber, setJumpWeekNumber] = useState<string>('');

  if (!classInfo) return null;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const chartData = classWeeks.map((week, index) => ({
    name: week.weekName,
    amount: weeklyTotals[index] || 0,
  }));

  const weekOptions = useMemo(() => {
    return classWeeks.map(w => ({ value: String(w.weekNumber), label: w.weekName }));
  }, [classWeeks]);

  const defaultPhotoUrl = studentGender === 'Male'
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces';

  const handleAddStudent = () => {
    const trimmedName = studentName.trim();
    if (!trimmedName) return;

    const parsedAge = Number(studentAge);
    const safeAge = Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : 0;

    const parsedStartWeek = Number(studentStartWeekNumber);
    const safeStartWeekNumber = Number.isFinite(parsedStartWeek) && parsedStartWeek > 0 ? parsedStartWeek : 1;

    addStudent(
      selectedClass,
      {
        name: trimmedName,
        gender: studentGender,
        age: safeAge,
        parentPhone: studentParentPhone.trim(),
        photoUrl: studentPhotoUrl.trim() || defaultPhotoUrl,
      },
      safeStartWeekNumber,
    );

    setStudentName('');
    setStudentGender('Male');
    setStudentAge('');
    setStudentParentPhone('');
    setStudentPhotoUrl('');
    setStudentStartWeekNumber('1');
    setAddStudentOpen(false);
  };

  const handleJumpToWeek = () => {
    if (!jumpWeekNumber) return;
    const el = document.getElementById(`week-${selectedClass}-${jumpWeekNumber}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{classInfo.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <GraduationCap className="w-4 h-4" />
            Tutor: {classInfo.tutor}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Start Week</Label>
                  <Select value={studentStartWeekNumber} onValueChange={setStudentStartWeekNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select start week" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekOptions.map(w => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-name">Name</Label>
                  <Input
                    id="student-name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Gender</Label>
                  <Select value={studentGender} onValueChange={(v) => setStudentGender(v as 'Male' | 'Female')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-age">Age</Label>
                  <Input
                    id="student-age"
                    type="number"
                    value={studentAge}
                    onChange={(e) => setStudentAge(e.target.value)}
                    placeholder="e.g. 10"
                    min={1}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-parent-phone">Parent Phone</Label>
                  <Input
                    id="student-parent-phone"
                    value={studentParentPhone}
                    onChange={(e) => setStudentParentPhone(e.target.value)}
                    placeholder="e.g. 0241234567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="student-photo-url">Photo URL (optional)</Label>
                  <Input
                    id="student-photo-url"
                    value={studentPhotoUrl}
                    onChange={(e) => setStudentPhotoUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleAddStudent} className="gap-2 gradient-primary">
                  <UserPlus className="w-4 h-4" />
                  Save Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => setCompactView(!compactView)}
            className="gap-2"
          >
            {compactView ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {compactView ? 'Full View' : 'Compact View'}
          </Button>

          <Button onClick={() => addWeek(selectedClass)} className="gap-2 gradient-primary">
            <Plus className="w-4 h-4" />
            Add Week
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <Select value={jumpWeekNumber} onValueChange={setJumpWeekNumber}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Jump to week" />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map(w => (
                <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleJumpToWeek} className="gap-2" disabled={!jumpWeekNumber}>
            <ArrowDown className="w-4 h-4" />
            Go
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-xl font-bold text-foreground">{classInfo.students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-school-success/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-school-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-xl font-bold text-school-success">
                  GH₵ {getClassTotalAmount(selectedClass).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-school-accent/20 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-school-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weeks Added</p>
                <p className="text-xl font-bold text-foreground">{classWeeks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      {chartData.length > 0 && (
        <Card className="card-shadow mb-6">
          <CardHeader>
            <CardTitle>Weekly Collection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    formatter={(value) => [`GH₵ ${value}`, 'Amount']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="amount" fill="#4361ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Tables per Week */}
      {classWeeks.map((week) => {
        const weekTotal = getClassWeeklyTotal(selectedClass, week.weekNumber);
        const weekStudents = getClassStudentsForWeek(selectedClass, week.weekNumber);
        
        return (
          <Card
            key={week.weekNumber}
            id={`week-${selectedClass}-${week.weekNumber}`}
            className="card-shadow mb-6 animate-slide-in"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {week.weekName}
                <span className="text-sm font-normal text-muted-foreground">
                  (GH₵ {CANTEEN_FEE}/day)
                </span>
              </CardTitle>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Week Total</p>
                <p className="text-xl font-bold text-school-success">GH₵ {weekTotal.toLocaleString()}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="min-w-[200px]">Student</TableHead>
                      {!compactView && <TableHead>Gender</TableHead>}
                      {!compactView && <TableHead>Age</TableHead>}
                      {!compactView && <TableHead>Parent Phone</TableHead>}
                      {days.map(day => (
                        <TableHead key={day} className="text-center w-16">{day}</TableHead>
                      ))}
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekStudents.map((student) => {
                      const payments = week.payments[student.id] || [false, false, false, false, false];
                      const studentTotal = getStudentWeeklyTotal(selectedClass, student.id, week.weekNumber);
                      
                      return (
                        <TableRow key={student.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={student.photoUrl} alt={student.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{student.name}</p>
                                {compactView && (
                                  <p className="text-xs text-muted-foreground">{student.gender}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          {!compactView && (
                            <TableCell>
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                student.gender === 'Male' 
                                  ? "bg-blue-100 text-blue-700" 
                                  : "bg-pink-100 text-pink-700"
                              )}>
                                {student.gender}
                              </span>
                            </TableCell>
                          )}
                          {!compactView && (
                            <TableCell className="text-muted-foreground">{student.age} yrs</TableCell>
                          )}
                          {!compactView && (
                            <TableCell className="text-muted-foreground">{student.parentPhone}</TableCell>
                          )}
                          {days.map((_, dayIndex) => (
                            <TableCell key={dayIndex} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={payments[dayIndex]}
                                  onCheckedChange={() => 
                                    togglePayment(selectedClass, week.weekNumber, student.id, dayIndex)
                                  }
                                  className="data-[state=checked]:bg-school-success data-[state=checked]:border-school-success data-[state=unchecked]:bg-destructive data-[state=unchecked]:border-destructive"
                                />
                              </div>
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-semibold",
                              studentTotal > 0 ? "text-school-success" : "text-muted-foreground"
                            )}>
                              GH₵ {studentTotal}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {classWeeks.length === 0 && (
        <Card className="card-shadow">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No weeks added yet. Click "Add Week" to start tracking payments.</p>
            <Button onClick={() => addWeek(selectedClass)} className="gap-2 gradient-primary">
              <Plus className="w-4 h-4" />
              Add First Week
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassView;
