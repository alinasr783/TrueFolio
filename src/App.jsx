import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { Suspense, lazy } from "react"
import Landing from "./pages/landing"
import WebDesign from "./pages/Services/jsx/WebDesign"
import MobileApp from "./pages/Services/jsx/MobileApp"
import Marketing from "./pages/Services/jsx/Marketing"
import SEO from "./pages/Services/jsx/SEO"
import ScrollStack from "./components/bits/jsx/test"
import Goals from "./pages/About/jsx/Goals"
import Contact from "./pages/Contact/jsx/Contact"
import Signup from "./pages/login/jsx/signup"
import Login from "./pages/login/jsx/login"
import ConfirmationSuccess from "./pages/login/jsx/done"
import EmailVerificationPage from "./pages/login/jsx/EmailVerificationPage"
const Dashboard = lazy(() => import("./pages/dashboard/jsx/main"))
const ProjectsManagementPage = lazy(() => import("./pages/dashboard/jsx/projects"))
const ProjectDetails = lazy(() => import("./pages/dashboard/jsx/project"))
const PlatformsPage = lazy(() => import("./pages/dashboard/jsx/Platforms"))
const PlatformDetails = lazy(() => import("./pages/dashboard/jsx/Platform"))
const BillingAndPayments = lazy(() => import("./pages/dashboard/jsx/BillingAndPayments"))
const ReferralProgram = lazy(() => import("./pages/dashboard/jsx/ReferralProgram"))
const Feedback = lazy(() => import("./pages/dashboard/jsx/Feedback"))
const ToolsPage = lazy(() => import("./pages/dashboard/jsx/Tools"))
const Tool_ImageToSite = lazy(() => import("./pages/dashboard/jsx/Tool_ImageToSite"))
const Tool_TextToArticle = lazy(() => import("./pages/dashboard/jsx/Tool_TextToArticle"))
const Tool_QRCodeGenerator = lazy(() => import("./pages/dashboard/jsx/Tool_QRCodeGenerator"))
const SettingsProfile = lazy(() => import("./pages/dashboard/jsx/SettingsProfile"))
const SettingsIntegrations = lazy(() => import("./pages/dashboard/jsx/SettingsIntegrations"))
const LibraryKnowledge = lazy(() => import("./pages/dashboard/jsx/LibraryKnowledge"))
const Review = lazy(() => import("./pages/dashboard/jsx/Review"))
const SiteViewer = lazy(() => import("./pages/site/SiteViewer"))
const SiteViewerGeneric = lazy(() => import("./pages/site/SiteViewerGeneric"))
const Sidebar = lazy(() => import("./pages/dashboard/jsx/Sidebar"))
import "./App.css"


function Shell() {
  const location = useLocation();
  const showSidebar = /^(\/dashboard|\/projects|\/project|\/billing|\/referral|\/feedback|\/library\/knowledge|\/review|\/settings\/profile|\/settings\/integrations|\/tools)/.test(location.pathname);
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-600">Loading...</div>}>
      {showSidebar && <Sidebar />}
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/services/webdesign" element={<WebDesign />} />
          <Route path="/services/mobileapp" element={<MobileApp />} />
          <Route path="/services/marketing" element={<Marketing />} />
          <Route path="/services/seo" element={<SEO />} />
          <Route path="/about/goals" element={<Goals />} />
          <Route path="/test" element={<ScrollStack />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/done" element={<ConfirmationSuccess />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/platforms" element={<PlatformsPage />} />
          <Route path="/dashboard/platform/:slug" element={<PlatformDetails />} />
          <Route path="/dashboard/tools" element={<ToolsPage />} />
          <Route path="/dashboard/tools/image-to-site" element={<Tool_ImageToSite />} />
          <Route path="/dashboard/tools/text-to-article" element={<Tool_TextToArticle />} />
          <Route path="/dashboard/tools/qr-code-generator" element={<Tool_QRCodeGenerator />} />
          <Route path="/dashboard/tools/qr-generator" element={<Tool_QRCodeGenerator />} />
          <Route path="/settings/profile" element={<SettingsProfile />} />
          <Route path="/settings/integrations" element={<SettingsIntegrations />} />
          <Route path="/projects" element={<ProjectsManagementPage />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/billing" element={<BillingAndPayments />} />
          <Route path="/referral" element={<ReferralProgram />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/library/knowledge" element={<LibraryKnowledge />} />
          <Route path="/review" element={<Review />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/image-to-site" element={<Tool_ImageToSite />} />
          <Route path="/tools/text-to-article" element={<Tool_TextToArticle />} />
          <Route path="/tools/qr-generator" element={<Tool_QRCodeGenerator />} />
          <Route path="/:username/image-to-site/:usageId" element={<SiteViewer />} />
          <Route path="/:username/:toolId/:usageId" element={<SiteViewerGeneric />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}

export default App
