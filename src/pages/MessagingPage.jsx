import { useState } from "react";
import { Send, Search, User } from "lucide-react";

export function MessagingPage() {
  const [newMessage, setNewMessage] = useState("");
  
  // We add React State to hold our messages so the screen updates when we send one
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I saw your post about Lost Mines of Phandelver. Is there still room?", sender: "them" },
    { id: 2, text: "Yes! We're looking for a rogue actually. Have you played 5e before?", sender: "me" }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Add the new message to our state array
    const newMsgObj = {
      id: Date.now(),
      text: newMessage,
      sender: "me"
    };
    
    setMessages([...messages, newMsgObj]);
    setNewMessage(""); // Clear the input box
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-5rem)]">
      <div className="bg-stone-800/80 border-4 border-amber-700 rounded-lg shadow-2xl h-full flex overflow-hidden">
        
        {/* Sidebar (Left static for demo purposes) */}
        <div className="hidden md:flex w-1/3 border-r-2 border-amber-800/50 flex-col bg-stone-900/50">
          <div className="p-4 border-b border-amber-800/50">
            <h2 className="text-xl font-bold text-amber-100 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600" />
              <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-amber-800 rounded-md text-amber-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <button className="w-full p-4 flex items-start gap-3 border-b border-amber-800/30 text-left bg-stone-800/80 border-l-4 border-l-amber-500 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-amber-100 truncate">ElvenRogue</h3>
                  <span className="text-xs text-amber-400/60 shrink-0">Active</span>
                </div>
                <p className="text-sm text-amber-200/70 truncate">Typing...</p>
              </div>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-stone-900/20">
          <div className="p-4 border-b border-amber-800/50 bg-stone-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-900/50 border border-amber-700 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold text-amber-100">ElvenRogue</h2>
              <p className="text-xs text-amber-400/60">Active now</p>
            </div>
          </div>

          {/* Dynamic Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[70%]">
                  <div className={`p-3 rounded-2xl ${
                    msg.sender === "me" 
                      ? "rounded-tr-sm bg-amber-600 text-white" 
                      : "rounded-tl-sm bg-stone-800 text-amber-100 border border-amber-800/50"
                  }`}>
                    <p>{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-amber-800/50 bg-stone-900/80">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type a message..." 
                className="flex-1 px-4 py-2 bg-stone-950 border border-amber-800 rounded-md text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600" 
              />
              <button type="submit" className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors flex items-center gap-2 cursor-pointer">
                <Send className="w-5 h-5" /> Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}