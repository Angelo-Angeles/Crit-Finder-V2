import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sword, Mail, Lock, User as UserIcon, AlertCircle } from "lucide-react";
import { loginWithGoogle, loginWithEmail, registerWithEmail, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to add user to Firestore so they show up in the DM list!
  const saveUserToDatabase = async (userObj, display) => {
    await setDoc(doc(db, "users", userObj.uid), {
      displayName: display,
      email: userObj.email,
      createdAt: new Date()
    }, { merge: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        const user = await registerWithEmail(email, password);
        // 1. Set their auth profile name
        await updateProfile(user, { displayName: username });
        // 2. Save them to the public users database for DMs
        await saveUserToDatabase(user, username);
      }
      navigate("/quest-board");
    } catch (err) {
      console.error(err);
      // Now it will show the ACTUAL Firebase error (like 'Password too weak')
      setError(err.message.replace("Firebase: ", "")); 
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        await saveUserToDatabase(user, user.displayName || "Google Adventurer");
        navigate("/quest-board");
      }
    } catch (error) {
      console.error("Google auth failed:", error);
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-stone-800/80 backdrop-blur-sm border-2 border-amber-700 rounded-lg shadow-2xl p-8">
          
          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <Sword className="w-10 h-10 text-amber-500" />
            <h2 className="text-3xl font-bold text-amber-100">
              {isLogin ? "Welcome Back" : "Join the Guild"}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-700 rounded-md flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-amber-200 mb-2">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" 
                    placeholder="Enter your username" 
                    required={!isLogin} 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" 
                  placeholder="Password (min 6 chars)" 
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold rounded-md transition-colors cursor-pointer">
              {loading ? "Consulting Archives..." : (isLogin ? "Login with Email" : "Create Account")}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-800/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-stone-800 text-amber-200/60">Or continue with</span>
              </div>
            </div>

            <button onClick={handleGoogleLogin} type="button" className="w-full py-3 bg-stone-900 hover:bg-stone-800 border border-amber-700 text-amber-100 font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer">
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google
            </button>
          </div>
          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-amber-300 hover:text-amber-200 text-sm">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}