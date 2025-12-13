import { useState } from 'react';
import { Menu, Settings, X, Dumbbell, Timer as TimerIcon, Clock } from 'lucide-react';
import TaskWorkout from './components/TaskWorkout';
import Stopwatch from './components/Stopwatch';
import Timer from './components/Timer';

type Section = 'task' | 'stopwatch' | 'timer';

function App() {
  const [activeSection, setActiveSection] = useState<Section>('task');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const sections = [
    { id: 'task' as Section, name: 'Task/Workout', icon: Dumbbell },
    { id: 'stopwatch' as Section, name: 'Stopwatch', icon: Clock },
    { id: 'timer' as Section, name: 'Timer', icon: TimerIcon },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">TimeTracker Pro</h1>
          </div>

          <nav className="hidden md:flex gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {section.name}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setShowSettings(true)}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings size={24} className="text-gray-700" />
          </button>
        </div>

        <nav className="flex md:hidden border-t border-gray-200 overflow-x-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{section.name}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeSection === 'task' && <TaskWorkout />}
        {activeSection === 'stopwatch' && <Stopwatch />}
        {activeSection === 'timer' && <Timer />}
      </main>

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 lg:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-700" />
                </button>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      {section.name}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                >
                  <Settings size={20} />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-700" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">About</h3>
                <p className="text-gray-700 mb-2">
                  <strong>TimeTracker Pro</strong> - A comprehensive time management tool for tasks, workouts, and more.
                </p>
                <p className="text-sm text-gray-600">
                  All your data is stored locally in your browser.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Data Management</h3>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Clear All Data
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  This will remove all saved tasks, workouts, and settings.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Version</h3>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
