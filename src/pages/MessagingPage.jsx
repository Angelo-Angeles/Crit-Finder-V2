import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Send, Search, User, Users, ArrowLeft } from "lucide-react";
import { auth, db } from "../firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, getDocs } from "firebase/firestore";

export function MessagingPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [activeChannel, setActiveChannel] = useState({ id: "global", name: "The Global Tavern", type: "global" });
  
  // Mobile UI State
  const [showSidebar, setShowSidebar] = useState(true);
  
  const scrollRef = useRef();
  const location = useLocation(); // To catch clicks from the Quest Board

  // 1. Catch incoming target users from the Quest Board
  useEffect(() => {
    if (location.state?.targetUser) {
      setActiveChannel({ 
        uid: location.state.targetUser.uid, 
        name: location.state.targetUser.name, 
        photoURL: location.state.targetUser.photoURL, 
        type: "dm" 
      });
      setShowSidebar(false); // Go straight to chat on mobile
    }
  }, [location.state]);

  // 2. Fetch all other users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const users = [];
      snapshot.forEach(doc => {
        if (doc.id !== auth.currentUser.uid) {
          users.push({ uid: doc.id, ...doc.data() });
        }
      });
      setUsersList(users);
    };
    fetchUsers();
  }, []);

  // 3. Listen to active channel messages
  useEffect(() => {
    if (!auth.currentUser) return;

    let q;
    if (activeChannel.type === "global") {
      q = query(collection(db, "tavern_chat"), orderBy("createdAt", "asc"), limit(50));
    } else {
      const myId = auth.currentUser.uid;
      const theirId = activeChannel.uid;
      const chatId = myId < theirId ? `${myId}_${theirId}` : `${theirId}_${myId}`;
      q = query(collection(db, "direct_messages", chatId, "messages"), orderBy("createdAt", "asc"), limit(50));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((doc) => fetchedMessages.push({ id: doc.id, ...doc.data() }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [activeChannel]);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  // 4. Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const messageText = newMessage;
    setNewMessage(""); 

    try {
      const messageData = {
        text: messageText,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Anonymous Adventurer",
        photoURL: auth.currentUser.photoURL || null,
      };

      if (activeChannel.type === "global") {
        await addDoc(collection(db, "tavern_chat"), messageData);
      } else {
        const myId = auth.currentUser.uid;
        const theirId = activeChannel.uid;
        const chatId = myId < theirId ? `${myId}_${theirId}` : `${theirId}_${myId}`;
        await addDoc(collection(db, "direct_messages", chatId, "messages"), messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleChannelSelect = (channelData) => {
    setActiveChannel(channelData);
    setShowSidebar(false); // Hide sidebar on mobile when a chat is selected
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-5rem)]">
      <div className="bg-stone-800/80 border-4 border-amber-700 rounded-lg shadow-2xl h-full flex overflow-hidden relative">
        
        {/* Sidebar (Toggles hidden/flex on mobile) */}
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-1/3 border-r-2 border-amber-800/50 flex-col bg-stone-900/50 absolute md:relative z-10 h-full`}>
          <div className="p-4 border-b border-amber-800/50">
            <h2 className="text-xl font-bold text-amber-100 mb-4">Channels</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
              <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-amber-800 rounded-md text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            
            <button 
              onClick={() => handleChannelSelect({ id: "global", name: "The Global Tavern", type: "global" })}
              className={`w-full p-4 flex items-center gap-3 border-b border-amber-800/30 text-left transition-colors cursor-pointer ${activeChannel.type === "global" ? "bg-stone-800/80 border-l-4 border-l-amber-500" : "hover:bg-stone-800/40"}`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-amber-100 truncate">The Global Tavern</h3>
                <p className="text-sm text-emerald-400/80 truncate">Public Chat Room</p>
              </div>
            </button>

            <div className="p-3 bg-stone-900 text-xs font-bold text-amber-500 uppercase tracking-wider">
              Direct Messages
            </div>

            {usersList.length === 0 && (
              <div className="p-4 text-sm text-amber-500/60 text-center">No other adventurers found yet.</div>
            )}

            {usersList.map(u => (
              <button 
                key={u.uid}
                onClick={() => handleChannelSelect({ uid: u.uid, name: u.displayName || "Unknown", photoURL: u.photoURL, type: "dm" })}
                className={`w-full p-4 flex items-center gap-3 border-b border-amber-800/30 text-left transition-colors cursor-pointer ${activeChannel.uid === u.uid ? "bg-stone-800/80 border-l-4 border-l-amber-500" : "hover:bg-stone-800/40"}`}
              >
                <div className="w-10 h-10 rounded-full bg-stone-800 border border-amber-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {u.photoURL ? <img src={u.photoURL} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-amber-400" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-amber-100 truncate">{u.displayName || "Unknown"}</h3>
                </div>
              </button>
            ))}

          </div>
        </div>

        {/* Chat Area */}
        <div className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-1 flex-col bg-stone-900/20 w-full`}>
          
          <div className="p-4 border-b border-amber-800/50 bg-stone-900/50 flex items-center gap-3 shrink-0">
            {/* Mobile Back Button */}
            <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 -ml-2 text-amber-400 hover:text-amber-200 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="w-10 h-10 rounded-full bg-stone-800 border border-amber-700 flex items-center justify-center overflow-hidden shrink-0">
              {activeChannel.type === "global" ? (
                <Users className="w-5 h-5 text-amber-400" />
              ) : activeChannel.photoURL ? (
                <img src={activeChannel.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-amber-100 truncate">{activeChannel.name}</h2>
              <p className="text-xs text-amber-400/60">{activeChannel.type === "global" ? "Public Chat Room" : "Direct Message"}</p>
            </div>
          </div>

          {/* Messages Wrapper (Same as before) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col">
            {messages.length === 0 ? (
              <div className="text-center text-amber-500/50 my-auto">
                No messages yet.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.uid === auth.currentUser?.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="w-8 h-8 rounded-full bg-stone-800 border border-amber-700 flex items-center justify-center shrink-0 overflow-hidden mt-1">
                        {msg.photoURL ? <img src={msg.photoURL} alt="avatar" className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <span className="text-xs text-amber-400/60 mb-1 px-1">{msg.displayName}</span>
                        <div className={`p-3 rounded-2xl ${isMe ? "rounded-tr-sm bg-amber-600 text-white" : "rounded-tl-sm bg-stone-800 text-amber-100 border border-amber-800/50"}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef}></div> 
          </div>

          <div className="p-4 border-t border-amber-800/50 bg-stone-900/80 shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." disabled={!auth.currentUser} className="flex-1 px-4 py-3 bg-stone-950 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 disabled:opacity-50" />
              <button type="submit" disabled={!auth.currentUser || !newMessage.trim()} className="px-4 sm:px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                <Send className="w-5 h-5" /> <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}