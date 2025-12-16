import React, { createContext, useContext, useState, ReactNode } from 'react';
import { classesData, ClassInfo, Student, generateInitialWeeks, WeekPayment, CANTEEN_FEE } from '@/data/mockData';

interface SchoolContextType {
  classes: ClassInfo[];
  selectedClass: number;
  setSelectedClass: (classId: number) => void;
  weeks: { [classId: number]: WeekPayment[] };
  addWeek: (classId: number) => void;
  addStudent: (
    classId: number,
    student: Omit<Student, 'id' | 'class'> & { id?: string },
    startWeekNumber?: number,
  ) => void;
  getClassStudentsForWeek: (classId: number, weekNumber: number) => Student[];
  togglePayment: (classId: number, weekNumber: number, studentId: string, dayIndex: number) => void;
  getStudentWeeklyTotal: (classId: number, studentId: string, weekNumber: number) => number;
  getClassWeeklyTotal: (classId: number, weekNumber: number) => number;
  getClassTotalAmount: (classId: number) => number;
  getWeeklyTotals: (classId: number) => number[];
  getMonthlyTotals: () => number[];
  compactView: boolean;
  setCompactView: (value: boolean) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassInfo[]>(() => classesData);
  const [selectedClass, setSelectedClass] = useState(1);
  const [compactView, setCompactView] = useState(false);
  const [studentStartWeek, setStudentStartWeek] = useState<Record<number, Record<string, number>>>(() => {
    const initial: Record<number, Record<string, number>> = {};
    classesData.forEach(c => {
      initial[c.id] = {};
      c.students.forEach(s => {
        initial[c.id][s.id] = 1;
      });
    });
    return initial;
  });
  const [weeks, setWeeks] = useState<{ [classId: number]: WeekPayment[] }>(() => {
    const initial: { [classId: number]: WeekPayment[] } = {};
    classesData.forEach(c => {
      initial[c.id] = generateInitialWeeks();
    });
    return initial;
  });

  const addStudent = (
    classId: number,
    student: Omit<Student, 'id' | 'class'> & { id?: string },
    startWeekNumber: number = 1,
  ) => {
    const baseId = student.id?.trim() || `class${classId}-student${Date.now()}`;
    const newStudent: Student = {
      ...student,
      id: baseId,
      class: classId,
    };

    setClasses(prev =>
      prev.map(c => (c.id === classId ? { ...c, students: [...c.students, newStudent] } : c))
    );

    setStudentStartWeek(prev => {
      const classMap = prev[classId] || {};
      return {
        ...prev,
        [classId]: {
          ...classMap,
          [newStudent.id]: startWeekNumber,
        },
      };
    });
  };

  const getClassStudentsForWeek = (classId: number, weekNumber: number): Student[] => {
    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo) return [];

    const classStartMap = studentStartWeek[classId] || {};
    return classInfo.students.filter(s => (classStartMap[s.id] ?? 1) <= weekNumber);
  };

  const addWeek = (classId: number) => {
    setWeeks(prev => {
      const classWeeks = prev[classId] || [];
      const newWeekNumber = classWeeks.length + 1;
      return {
        ...prev,
        [classId]: [
          ...classWeeks,
          { weekNumber: newWeekNumber, weekName: `Week ${newWeekNumber}`, payments: {} }
        ]
      };
    });
  };

  const togglePayment = (classId: number, weekNumber: number, studentId: string, dayIndex: number) => {
    setWeeks(prev => {
      const classWeeks = [...(prev[classId] || [])];
      const weekIndex = classWeeks.findIndex(w => w.weekNumber === weekNumber);
      
      if (weekIndex === -1) return prev;

      const week = { ...classWeeks[weekIndex] };
      const studentPayments = [...(week.payments[studentId] || [false, false, false, false, false])];
      studentPayments[dayIndex] = !studentPayments[dayIndex];
      
      week.payments = { ...week.payments, [studentId]: studentPayments };
      classWeeks[weekIndex] = week;

      return { ...prev, [classId]: classWeeks };
    });
  };

  const getStudentWeeklyTotal = (classId: number, studentId: string, weekNumber: number): number => {
    const classWeeks = weeks[classId] || [];
    const week = classWeeks.find(w => w.weekNumber === weekNumber);
    if (!week) return 0;
    
    const payments = week.payments[studentId] || [];
    const paidDays = payments.filter(Boolean).length;
    return paidDays * CANTEEN_FEE;
  };

  const getClassWeeklyTotal = (classId: number, weekNumber: number): number => {
    const students = getClassStudentsForWeek(classId, weekNumber);
    return students.reduce((total, student) => {
      return total + getStudentWeeklyTotal(classId, student.id, weekNumber);
    }, 0);
  };

  const getClassTotalAmount = (classId: number): number => {
    const classWeeks = weeks[classId] || [];
    return classWeeks.reduce((total, week) => {
      return total + getClassWeeklyTotal(classId, week.weekNumber);
    }, 0);
  };

  const getWeeklyTotals = (classId: number): number[] => {
    const classWeeks = weeks[classId] || [];
    return classWeeks.map(week => getClassWeeklyTotal(classId, week.weekNumber));
  };

  const getMonthlyTotals = (): number[] => {
    // Simulate monthly totals (4 weeks per month, 3 months)
    const months: number[] = [];
    for (let month = 0; month < 3; month++) {
      let monthTotal = 0;
      classes.forEach(c => {
        const classWeeks = weeks[c.id] || [];
        const startWeek = month * 4;
        const endWeek = Math.min(startWeek + 4, classWeeks.length);
        for (let i = startWeek; i < endWeek; i++) {
          if (classWeeks[i]) {
            monthTotal += getClassWeeklyTotal(c.id, classWeeks[i].weekNumber);
          }
        }
      });
      months.push(monthTotal);
    }
    return months;
  };

  return (
    <SchoolContext.Provider value={{
      classes,
      selectedClass,
      setSelectedClass,
      weeks,
      addWeek,
      addStudent,
      getClassStudentsForWeek,
      togglePayment,
      getStudentWeeklyTotal,
      getClassWeeklyTotal,
      getClassTotalAmount,
      getWeeklyTotals,
      getMonthlyTotals,
      compactView,
      setCompactView,
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
