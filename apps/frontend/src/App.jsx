import { Routes, Route, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const { sidebarOpen } = useApp();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-industrial-900 grid-bg">
      <Sidebar />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? 256 : 72 }}
      >
        <TopBar />
        <main className="p-6">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/dashboard" element={<PageWrap><Dashboard /></PageWrap>} />
              <Route path="/machines" element={<PageWrap><Machines /></PageWrap>} />
              <Route path="/machines/:id" element={<PageWrap><MachineDetail /></PageWrap>} />
              <Route path="/predictions" element={<PageWrap><Predictions /></PageWrap>} />
              <Route path="/alerts" element={<PageWrap><Alerts /></PageWrap>} />
              <Route path="/analytics" element={<PageWrap><Analytics /></PageWrap>} />
              <Route path="/automation" element={<PageWrap><Automation /></PageWrap>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
