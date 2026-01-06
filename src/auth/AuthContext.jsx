import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const goalsQuery = query(
          collection(db, "goals"),
          where("userId", "==", u.uid)
        );

        const goalsSnap = await getDocs(goalsQuery);

        if (goalsSnap.empty) {
          const goalRef = await addDoc(collection(db, "goals"), {
            title: "Build Consistency",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            createdAt: new Date(),
            userId: u.uid
          });

          const starterHabits = [
            "Plan your day",
            "Focus for 30 minutes",
            "Reflect at night"
          ];

          for (const habit of starterHabits) {
            await addDoc(collection(db, "habits"), {
              title: habit,
              goalId: goalRef.id,
              createdAt: new Date(),
              userId: u.uid
            });
          }
        }
      }

      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
