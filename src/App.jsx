import { useEffect, useState, useContext } from "react";

import Splash from "./pages/Splash";
import Tracker from "./pages/Tracker";
import GoalsCalendar from "./pages/GoalsCalendar";
import EditTasks from "./pages/EditTasks";
import Account from "./pages/Account";
import CreateGoal from "./pages/CreateGoal";
import DayDetails from "./pages/DayDetails";
import BottomNav from "./components/BottomNav";
import { HabitProvider, HabitContext } from "./context/HabitContext";
import { useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState({ name: "splash" });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [fadeOut, setFadeOut] = useState(false);
  const { loadAllData } = useContext(HabitContext);

  const transitionStyles = `
    @keyframes screenFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .screen-transition {
      animation: screenFadeUp 220ms ease;
    }
  `;

  useEffect(() => {
    // Load all data once when app starts
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    setTimeout(() => setFadeOut(true), 800);
    setTimeout(() => setScreen({ name: "tracker" }), 1100);
  }, []);

  if (screen.name === "splash") return <Splash fadeOut={fadeOut} />;

  const renderScreen = () => {
    switch (screen.name) {
      case "tracker":
        return <Tracker selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal} />;
      case "goals":
        return <GoalsCalendar setScreen={setScreen} selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal} />;
      case "edit":
        return <EditTasks setScreen={setScreen} goalId={screen.goalId} />;
      case "create":
        return <CreateGoal setScreen={setScreen} />;
      case "day":
        return <DayDetails goalId={screen.goalId} date={screen.date} setScreen={setScreen} />;
      case "account":
        return <Account />;
      default:
        return <Tracker selectedGoal={selectedGoal} setSelectedGoal={setSelectedGoal} />;
    }
  };

  return (
    <>
      <style>{transitionStyles}</style>
      <div className="screen-transition" key={screen.name}>
        {renderScreen()}
      </div>

      <BottomNav
        setScreen={setScreen}
        current={screen.name}
      />
    </>
  );
}
