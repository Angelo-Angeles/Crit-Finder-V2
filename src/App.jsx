import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./Layout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { QuestBoardPage } from "./pages/QuestBoardPage";
import { MessagingPage } from "./pages/MessagingPage";
import { UserControlPage } from "./pages/UserControlPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The Layout component wraps all routes to provide the top navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="quest-board" element={<QuestBoardPage />} />
          <Route path="messages" element={<MessagingPage />} />
          <Route path="profile" element={<UserControlPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}