import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import AppNavbar from './components/Navbar';
import CreateCourse from './pages/instructor/CreateCourse';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/auth/Login';
import ManageUsers from './pages/admin/ManageUsers';
import Register from './pages/auth/Register';
import Home from './pages/Home';
import CourseLearn from './pages/student/CourseLearn';
import ChatWidget from './components/chatbot/ChatWidget';
import MyCourses from './pages/student/MyCourses';
import EnrolledStudents from './pages/instructor/EnrolledStudents';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/Profile';
import InstructorProfile from './pages/instructor/InstructorProfile';
import ManageCourses from './pages/admin/ManageCourses';


function App() {
  return (
  <> 
    <AppNavbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/my-courses" element={<MyCourses />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/courses" element={<ManageCourses />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
      <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/my-courses/:courseId" element={<CourseLearn />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/instructor/courses/new" element={<CreateCourse />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
      <Route path="/instructor" element={<InstructorDashboard />} />
      <Route path="/instructor/courses/new" element={<CreateCourse />} />
      <Route path="/instructor/courses/:courseId/students" element={<EnrolledStudents />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']} />}>
      <Route path="/profile" element={<Profile />} />
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/profile" element={<InstructorProfile />} />
        <Route path="/instructor/courses/new" element={<CreateCourse />} />
        <Route path="/instructor/courses/:courseId/students" element={<EnrolledStudents />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
        <Route path="/instructor" element={<InstructorDashboard />} />
      </Route>
      <Route path="/courses/:id" element={<CourseDetail />} />
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>

    <ChatWidget />
    </> 
  );
}

export default App;