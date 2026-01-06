import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function TaskItem({ task }) {
  const toggle = async () => {
    await updateDoc(doc(db, "tasks", task.id), {
      completed: !task.completed
    });
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <input type="checkbox" checked={task.completed} onChange={toggle} />
      <span style={{
        marginLeft: "10px",
        textDecoration: task.completed ? "line-through" : "none"
      }}>
        {task.title}
      </span>
    </div>
  );
}
