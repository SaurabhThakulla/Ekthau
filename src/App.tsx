import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { GuestProvider } from '@/features/guest/GuestContext'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import DashboardLayout from '@/layouts/DashboardLayout'
import Overview from '@/pages/dashboard/Overview'
import CreateEvent from '@/pages/dashboard/CreateEvent'
import EventDetail from '@/pages/dashboard/EventDetail'
import JoinEvent from '@/pages/guest/JoinEvent'
import Camera from '@/pages/guest/Camera'
import GuestGallery from '@/pages/guest/Gallery'
import Moderation from '@/pages/dashboard/Moderation'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const { session } = useAuth()

  return (
    <GuestProvider>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Host Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="events/new" element={<CreateEvent />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/:id/moderation" element={<Moderation />} />
        </Route>

        {/* Guest Routes */}
        <Route path="/join/:slug" element={<JoinEvent />} />
        <Route path="/e/:slug/camera" element={<Camera />} />
        <Route path="/e/:slug/gallery" element={<GuestGallery />} />
      </Routes>
    </GuestProvider>
  )
}

export default App
