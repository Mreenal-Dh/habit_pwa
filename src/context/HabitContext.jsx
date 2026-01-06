import { createContext, useState, useCallback } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

export const HabitContext = createContext();

export function HabitProvider({ children }) {
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);

      if (!user) {
        setGoals([]);
        setHabits([]);
        setLogs([]);
        return;
      }

      // Fetch all goals
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), where("userId", "==", user.uid))
      );
      const goalsList = goalsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setGoals(goalsList);

      // Fetch all habits
      const habitsSnap = await getDocs(
        query(collection(db, "habits"), where("userId", "==", user.uid))
      );
      const habitsList = habitsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setHabits(habitsList);

      // Fetch all habit_logs
      const logsSnap = await getDocs(
        query(collection(db, "habit_logs"), where("userId", "==", user.uid))
      );
      const logsList = logsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setLogs(logsList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshGoals = useCallback(async () => {
    try {
      const goalsSnap = await getDocs(
        query(collection(db, "goals"), where("userId", "==", user?.uid))
      );
      const goalsList = goalsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setGoals(goalsList);
    } catch (error) {
      console.error("Error refreshing goals:", error);
    }
  }, [user]);

  const refreshHabits = useCallback(async () => {
    try {
      const habitsSnap = await getDocs(
        query(collection(db, "habits"), where("userId", "==", user?.uid))
      );
      const habitsList = habitsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setHabits(habitsList);
    } catch (error) {
      console.error("Error refreshing habits:", error);
    }
  }, [user]);

  const refreshLogs = useCallback(async () => {
    try {
      const logsSnap = await getDocs(
        query(collection(db, "habit_logs"), where("userId", "==", user?.uid))
      );
      const logsList = logsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setLogs(logsList);
    } catch (error) {
      console.error("Error refreshing logs:", error);
    }
  }, [user]);

  const updateLogInCache = useCallback((habitId, date, completed, goalId) => {
    setLogs(prev => {
      const updated = [...prev];
      const logIndex = updated.findIndex(
        log => log.habitId === habitId && log.date === date
      );
      
      if (logIndex >= 0) {
        // Update existing log
        updated[logIndex] = { ...updated[logIndex], completed };
      } else {
        // Create new log
        updated.push({
          id: `${habitId}_${date}`,
          habitId,
          goalId: goalId || '',
          date,
          completed,
          userId: user?.uid,
          createdAt: new Date(),
        });
      }
      return updated;
    });
  }, [user]);

  const value = {
    goals,
    habits,
    logs,
    loading,
    loadAllData,
    refreshGoals,
    refreshHabits,
    refreshLogs,
    updateLogInCache,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}
