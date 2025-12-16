export interface Student {
  id: string;
  name: string;
  class: number;
  gender: 'Male' | 'Female';
  age: number;
  parentPhone: string;
  photoUrl: string;
}

export interface ClassInfo {
  id: number;
  name: string;
  tutor: string;
  students: Student[];
}

export interface WeekPayment {
  weekNumber: number;
  weekName: string;
  payments: { [studentId: string]: boolean[] }; // 5 days per week
}

const malePhotos = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
];

const femalePhotos = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
];

const boyNames = ['Kwame Asante', 'Kofi Mensah', 'Yaw Boateng', 'Kwaku Owusu', 'Kojo Appiah', 'Kwabena Adjei'];
const girlNames = ['Ama Serwaa', 'Akosua Darko', 'Adwoa Mensah', 'Abena Osei', 'Afua Boateng', 'Yaa Asantewaa'];

const tutors = [
  'Mr. Emmanuel Asare',
  'Mrs. Grace Mensah',
  'Mr. Samuel Owusu',
  'Mrs. Abigail Boateng',
  'Mr. Daniel Adjei',
  'Mrs. Elizabeth Appiah',
];

function generateStudents(classNumber: number, count: number): Student[] {
  const students: Student[] = [];
  
  for (let i = 0; i < count; i++) {
    const isMale = i % 2 === 0;
    const names = isMale ? boyNames : girlNames;
    const photos = isMale ? malePhotos : femalePhotos;
    
    students.push({
      id: `class${classNumber}-student${i + 1}`,
      name: names[i % names.length] + ` ${String.fromCharCode(65 + i)}`,
      class: classNumber,
      gender: isMale ? 'Male' : 'Female',
      age: 5 + classNumber + Math.floor(Math.random() * 2),
      parentPhone: `024${Math.floor(1000000 + Math.random() * 9000000)}`,
      photoUrl: photos[i % photos.length],
    });
  }
  
  return students;
}

export const classesData: ClassInfo[] = [
  { id: 1, name: 'Class 1', tutor: tutors[0], students: generateStudents(1, 8) },
  { id: 2, name: 'Class 2', tutor: tutors[1], students: generateStudents(2, 10) },
  { id: 3, name: 'Class 3', tutor: tutors[2], students: generateStudents(3, 9) },
  { id: 4, name: 'Class 4', tutor: tutors[3], students: generateStudents(4, 11) },
  { id: 5, name: 'Class 5', tutor: tutors[4], students: generateStudents(5, 8) },
  { id: 6, name: 'Class 6', tutor: tutors[5], students: generateStudents(6, 10) },
];

export const CANTEEN_FEE = 20; // GH₵ per day

export const generateInitialWeeks = (): WeekPayment[] => {
  return [
    { weekNumber: 1, weekName: 'Week 1', payments: {} },
    { weekNumber: 2, weekName: 'Week 2', payments: {} },
    { weekNumber: 3, weekName: 'Week 3', payments: {} },
    { weekNumber: 4, weekName: 'Week 4', payments: {} },
  ];
};
