import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseConfigured } from '../config/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const userId = currentUser?.uid || 'guest';

  const [tasks, setTasks] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [events, setEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Helper to get local user-scoped storage key
  const getStorageKey = (type) => `sa_${userId}_${type}`;

  // Reset and Load data whenever active User ID changes
  useEffect(() => {
    setDataLoading(true);

    if (isFirebaseConfigured && db && currentUser?.uid) {
      // Subscribe to Firestore collections under users/{userId}/*
      const tasksRef = collection(db, 'users', userId, 'tasks');
      const alarmsRef = collection(db, 'users', userId, 'alarms');
      const schedulesRef = collection(db, 'users', userId, 'schedules');
      const eventsRef = collection(db, 'users', userId, 'events');

      const unsubTasks = onSnapshot(tasksRef, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(list);
        localStorage.setItem(getStorageKey('tasks'), JSON.stringify(list));
      });

      const unsubAlarms = onSnapshot(alarmsRef, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAlarms(list);
        localStorage.setItem(getStorageKey('alarms'), JSON.stringify(list));
      });

      const unsubSchedules = onSnapshot(schedulesRef, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSchedules(list);
        localStorage.setItem(getStorageKey('schedules'), JSON.stringify(list));
      });

      const unsubEvents = onSnapshot(eventsRef, (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEvents(list);
        localStorage.setItem(getStorageKey('events'), JSON.stringify(list));
      });

      setDataLoading(false);

      return () => {
        unsubTasks();
        unsubAlarms();
        unsubSchedules();
        unsubEvents();
      };
    } else {
      // Local User Scoped Storage (Offline / Demo Mode)
      try {
        const storedTasks = localStorage.getItem(getStorageKey('tasks'));
        const storedAlarms = localStorage.getItem(getStorageKey('alarms'));
        const storedSchedules = localStorage.getItem(getStorageKey('schedules'));
        const storedEvents = localStorage.getItem(getStorageKey('events'));

        // If new user and no storage exists yet -> initialize clean empty array
        setTasks(storedTasks ? JSON.parse(storedTasks) : []);
        setAlarms(storedAlarms ? JSON.parse(storedAlarms) : []);
        setSchedules(storedSchedules ? JSON.parse(storedSchedules) : []);
        setEvents(storedEvents ? JSON.parse(storedEvents) : []);
      } catch (e) {
        console.error('Error loading user-scoped data:', e);
        setTasks([]);
        setAlarms([]);
        setSchedules([]);
        setEvents([]);
      }
      setDataLoading(false);
    }
  }, [userId, isFirebaseConfigured, currentUser]);

  // Sync to local storage on state change
  const saveLocal = (type, data) => {
    localStorage.setItem(getStorageKey(type), JSON.stringify(data));
  };

  // --- TASKS ACTIONS ---
  const addTask = async (newTask) => {
    const taskObj = {
      ...newTask,
      id: newTask.id || '_' + Math.random().toString(36).substr(2, 9),
      userId,
      createdAt: newTask.createdAt || Date.now()
    };

    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'tasks', taskObj.id), taskObj);
    } else {
      const updated = [taskObj, ...tasks];
      setTasks(updated);
      saveLocal('tasks', updated);
    }
    return taskObj;
  };

  const updateTask = async (taskId, updates) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'tasks', taskId), updates, { merge: true });
    } else {
      const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      setTasks(updated);
      saveLocal('tasks', updated);
    }
  };

  const deleteTask = async (taskId) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await deleteDoc(doc(db, 'users', userId, 'tasks', taskId));
    } else {
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated);
      saveLocal('tasks', updated);
    }
  };

  const toggleTaskCompleted = async (taskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    await updateTask(taskId, { completed: !target.completed });
  };

  // --- ALARMS ACTIONS ---
  const addAlarm = async (newAlarm) => {
    const alarmObj = {
      ...newAlarm,
      id: newAlarm.id || '_' + Math.random().toString(36).substr(2, 9),
      userId,
      enabled: newAlarm.enabled ?? true
    };

    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'alarms', alarmObj.id), alarmObj);
    } else {
      const updated = [...alarms, alarmObj];
      setAlarms(updated);
      saveLocal('alarms', updated);
    }
  };

  const updateAlarm = async (alarmId, updates) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'alarms', alarmId), updates, { merge: true });
    } else {
      const updated = alarms.map(a => a.id === alarmId ? { ...a, ...updates } : a);
      setAlarms(updated);
      saveLocal('alarms', updated);
    }
  };

  const deleteAlarm = async (alarmId) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await deleteDoc(doc(db, 'users', userId, 'alarms', alarmId));
    } else {
      const updated = alarms.filter(a => a.id !== alarmId);
      setAlarms(updated);
      saveLocal('alarms', updated);
    }
  };

  const toggleAlarm = async (alarmId) => {
    const target = alarms.find(a => a.id === alarmId);
    if (!target) return;
    await updateAlarm(alarmId, { enabled: !target.enabled });
  };

  // --- SCHEDULES ACTIONS ---
  const addSchedule = async (newSchedule) => {
    const schedObj = {
      ...newSchedule,
      id: newSchedule.id || '_' + Math.random().toString(36).substr(2, 9),
      userId
    };

    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'schedules', schedObj.id), schedObj);
    } else {
      const updated = [...schedules, schedObj];
      setSchedules(updated);
      saveLocal('schedules', updated);
    }
  };

  const deleteSchedule = async (schedId) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await deleteDoc(doc(db, 'users', userId, 'schedules', schedId));
    } else {
      const updated = schedules.filter(s => s.id !== schedId);
      setSchedules(updated);
      saveLocal('schedules', updated);
    }
  };

  // --- CALENDAR EVENTS ACTIONS ---
  const addEvent = async (newEvent) => {
    const eventObj = {
      ...newEvent,
      id: newEvent.id || '_' + Math.random().toString(36).substr(2, 9),
      userId
    };

    if (isFirebaseConfigured && db && currentUser?.uid) {
      await setDoc(doc(db, 'users', userId, 'events', eventObj.id), eventObj);
    } else {
      const updated = [...events, eventObj];
      setEvents(updated);
      saveLocal('events', updated);
    }
  };

  const deleteEvent = async (eventId) => {
    if (isFirebaseConfigured && db && currentUser?.uid) {
      await deleteDoc(doc(db, 'users', userId, 'events', eventId));
    } else {
      const updated = events.filter(e => e.id !== eventId);
      setEvents(updated);
      saveLocal('events', updated);
    }
  };

  const value = {
    userId,
    dataLoading,
    tasks,
    alarms,
    schedules,
    events,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompleted,
    addAlarm,
    updateAlarm,
    deleteAlarm,
    toggleAlarm,
    addSchedule,
    deleteSchedule,
    addEvent,
    deleteEvent
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useUserData = () => useContext(DataContext);
