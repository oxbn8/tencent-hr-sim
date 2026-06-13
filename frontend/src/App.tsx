import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import OnboardingOrg from "./pages/OnboardingOrg";
import OnboardingRole from "./pages/OnboardingRole";
import OnboardingGuide from "./pages/OnboardingGuide";
import Game from "./pages/Game";
import Challenge from "./pages/Challenge";
import Result from "./pages/Result";
import Report from "./pages/Report";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/onboarding/org" element={<OnboardingOrg />} />
      <Route path="/onboarding/role" element={<OnboardingRole />} />
      <Route path="/onboarding/guide" element={<OnboardingGuide />} />
      <Route path="/game" element={<Game />} />
      <Route path="/game/challenge/:taskId" element={<Challenge />} />
      <Route path="/game/result/:submissionId" element={<Result />} />
      <Route path="/game/report" element={<Report />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
