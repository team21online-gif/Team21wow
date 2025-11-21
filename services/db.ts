import { User, Course, Submission, UserRole, UserStatus } from '../types';

const KEYS = {
  USERS: 'team21_users',
  COURSES: 'team21_courses',
  SUBMISSIONS: 'team21_submissions',
  CURRENT_USER: 'team21_current_user',
};

// Initial Seed
const initDB = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const admin: User = {
      id: 'admin-1',
      username: 'admin',
      password: 'team21admin',
      fullName: 'System Admin',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([admin]));
  }
  if (!localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.SUBMISSIONS)) {
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify([]));
  }
};

initDB();

// Helpers
export const getItems = <T>(key: string): T[] => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : [];
};

export const setItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

// Users
export const getUsers = (): User[] => getItems<User>(KEYS.USERS);
export const saveUser = (user: User) => {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  setItems(KEYS.USERS, users);
};

// Courses
export const getCourses = (): Course[] => getItems<Course>(KEYS.COURSES);
export const saveCourse = (course: Course) => {
  const courses = getCourses();
  const idx = courses.findIndex((c) => c.id === course.id);
  if (idx >= 0) {
    courses[idx] = course;
  } else {
    courses.push(course);
  }
  setItems(KEYS.COURSES, courses);
};

// Submissions
export const getSubmissions = (): Submission[] => getItems<Submission>(KEYS.SUBMISSIONS);
export const saveSubmission = (sub: Submission) => {
  const subs = getSubmissions();
  const idx = subs.findIndex((s) => s.id === sub.id);
  if (idx >= 0) {
    subs[idx] = sub;
  } else {
    subs.push(sub);
  }
  setItems(KEYS.SUBMISSIONS, subs);
};

// Auth
export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active. Please contact admin.');
    }
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const u = localStorage.getItem(KEYS.CURRENT_USER);
  return u ? JSON.parse(u) : null;
};
