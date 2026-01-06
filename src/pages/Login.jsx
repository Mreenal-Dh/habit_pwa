import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";

export default function Login() {
  async function login() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      // Fallback for environments that block popups (e.g., in-app browsers / previews)
      await signInWithRedirect(auth, provider);
    }
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "48px 40px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        maxWidth: "400px",
        width: "90%",
      }}>
        <h1 style={{
          fontSize: "48px",
          fontWeight: "700",
          margin: "0 0 8px 0",
          color: "#333",
          letterSpacing: "-1px",
        }}>
          habit.
        </h1>
        
        <p style={{
          fontSize: "16px",
          color: "#666",
          margin: "0 0 32px 0",
          lineHeight: "1.5",
        }}>
          Build better habits, one day at a time
        </p>

        <button
          onClick={login}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
            backgroundColor: "white",
            border: "2px solid #e0e0e0",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#4caf50";
            e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e0e0e0";
            e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.737 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          fontSize: "12px",
          color: "#999",
          margin: "24px 0 0 0",
        }}>
          Track your habits. Build your future.
        </p>
      </div>
    </div>
  );
}
