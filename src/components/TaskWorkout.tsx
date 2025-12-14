import { useState, useEffect } from 'react';
import { Play, Pause, Plus, Trash2, Save, Clock, Edit2 } from 'lucide-react';
import { WorkoutTask, TaskItem } from '../types';

export default function TaskWorkout() {
  const [tasks, setTasks] = useState<WorkoutTask[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<TaskItem[]>([]);
  const [currentItem, setCurrentItem] = useState({ name: '', duration: 0, customDuration: '' });
  const [selectedTask, setSelectedTask] = useState<WorkoutTask | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemDuration, setEditItemDuration] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('workoutTasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('workoutTasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isRunning && selectedTask && currentItemIndex > 0) {
      const currentItem = selectedTask.items[currentItemIndex];
      speakText(`${currentItem.name}`);
    }
  }, [currentItemIndex, isRunning, selectedTask]);

  useEffect(() => {
    if (!isRunning || isPaused || !selectedTask) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        if (newTime <= 10 && newTime > 0) {
          speakText(newTime.toString());
        }

        if (newTime <= 0) {
          if (currentItemIndex < selectedTask.items.length - 1) {
            setCurrentItemIndex((i) => i + 1);
            return selectedTask.items[currentItemIndex + 1].duration;
          } else {
            setIsRunning(false);
            setCurrentItemIndex(0);
            speakText('Task completed');
            return 0;
          }
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, currentItemIndex, selectedTask]);

  const addTaskItem = () => {
    if (!currentItem.name || currentItem.duration === 0) return;

    const newItem: TaskItem = {
      id: Date.now().toString(),
      name: currentItem.name,
      duration: currentItem.duration,
      type: 'task'
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: '', duration: 0, customDuration: '' });
  };

  const addInterval = (duration: number) => {
    const newItem: TaskItem = {
      id: Date.now().toString(),
      name: 'Rest Interval',
      duration,
      type: 'interval'
    };

    setItems([...items, newItem]);
  };

  const saveWorkoutTask = () => {
    if (!title || items.length === 0) return;

    const newTask: WorkoutTask = {
      id: Date.now().toString(),
      title,
      items
    };

    setTasks([...tasks, newTask]);
    setTitle('');
    setItems([]);
    setIsCreating(false);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const startEditTask = (task: WorkoutTask) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const saveEditTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, title: editTitle } : t
    ));
    setEditingTaskId(null);
    setEditTitle('');
  };

  const startEditItem = (item: TaskItem) => {
    setEditingItemId(item.id);
    setEditItemName(item.name);
    setEditItemDuration(item.duration.toString());
  };

  const saveEditItem = (itemId: string) => {
    setItems(items.map(i =>
      i.id === itemId ? { ...i, name: editItemName, duration: parseInt(editItemDuration) || 0 } : i
    ));
    setEditingItemId(null);
    setEditItemName('');
    setEditItemDuration('');
  };

  const startWorkout = (task: WorkoutTask) => {
    setSelectedTask(task);
    setCurrentItemIndex(0);
    setTimeRemaining(task.items[0].duration);
    setIsRunning(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const stopWorkout = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentItemIndex(0);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = (task: WorkoutTask) => {
    return task.items.reduce((sum, item) => sum + item.duration, 0);
  };

  if (isRunning && selectedTask) {
    const currentRunningItem = selectedTask.items[currentItemIndex];
    const progress = ((currentRunningItem.duration - timeRemaining) / currentRunningItem.duration) * 100;

    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{selectedTask.title}</h2>

          <div className="mb-8">
            <div className="text-center mb-4">
              <span className="text-sm font-medium text-gray-500">
                {currentItemIndex + 1} of {selectedTask.items.length}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
              {currentRunningItem.name}
            </h3>
            <div className="text-6xl font-bold text-blue-600 text-center mb-4">
              {formatTime(timeRemaining)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopWorkout}
              className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-lg font-medium"
            >
              Stop
            </button>
          </div>

          <div className="mt-8 space-y-2">
            {selectedTask.items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg transition-colors ${
                  idx === currentItemIndex
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : idx < currentItemIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">{formatTime(item.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tasks & Workouts</h1>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus size={20} />
              Add Task/Workout
            </button>
          )}
        </div>

        {isCreating && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Task/Workout</h2>

            <input
              type="text"
              placeholder="Task/Workout Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none mb-4"
            />

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-medium text-gray-700 mb-3">Add Task/Exercise</h3>
              <input
                type="text"
                placeholder="Task/Exercise Name"
                value={currentItem.name}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none mb-3"
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Duration (seconds)"
                  value={currentItem.customDuration}
                  onChange={(e) => setCurrentItem({ ...currentItem, duration: parseInt(e.target.value) || 0, customDuration: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={addTaskItem}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Task
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <h3 className="font-medium text-gray-700 mb-3">Add Interval</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addInterval(20)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  20 seconds
                </button>
                <button
                  onClick={() => addInterval(40)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  40 seconds
                </button>
                <button
                  onClick={() => addInterval(60)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  1 minute
                </button>
                <button
                  onClick={() => {
                    const custom = prompt('Enter duration in seconds:');
                    if (custom) addInterval(parseInt(custom));
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Custom
                </button>
              </div>
            </div>

            {items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-3">Items ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id}>
                      {editingItemId === item.id ? (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-500 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Exercise/Interval Name</label>
                            <input
                              type="text"
                              value={editItemName}
                              onChange={(e) => setEditItemName(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (seconds)</label>
                            <input
                              type="number"
                              value={editItemDuration}
                              onChange={(e) => setEditItemDuration(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEditItem(item.id)}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItemId(null)}
                              className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm font-medium rounded hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => startEditItem(item)}
                          className="cursor-pointer flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-medium text-gray-500">{idx + 1}.</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{item.name}</div>
                              <div className="text-sm text-gray-500">{formatTime(item.duration)}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditItem(item);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={saveWorkoutTask}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <Save size={20} />
                Save Task/Workout
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setTitle('');
                  setItems([]);
                }}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none mr-2"
                  />
                ) : (
                  <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                )}
                <div className="flex gap-2">
                  {editingTaskId === task.id ? (
                    <>
                      <button
                        onClick={() => saveEditTask(task.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingTaskId(null)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4 space-y-2">
                {task.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="text-gray-500">{formatTime(item.duration)}</span>
                  </div>
                ))}
                {task.items.length > 3 && (
                  <div className="text-sm text-gray-400">+ {task.items.length - 3} more</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span className="text-sm font-medium">{formatTime(getTotalDuration(task))}</span>
                </div>
                <button
                  onClick={() => startWorkout(task)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Play size={16} />
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>

        {tasks.length === 0 && !isCreating && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Clock size={64} className="mx-auto mb-4" />
              <p className="text-lg">No tasks or workouts yet</p>
              <p className="text-sm">Create your first task/workout to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
