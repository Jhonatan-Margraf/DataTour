import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { PredictionPage } from "./pages/PredictionPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { DataSourcesPage } from "./pages/DataSourcesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TeamPage } from "./pages/TeamPage";

// LOGIN DESATIVADO — rota preservada mas não acessível pelo fluxo normal
// Para reativar: remova o redirect abaixo e restaure o handleLogout no DashboardLayout

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: OverviewPage },
      { path: "prediction", Component: PredictionPage },
      { path: "equipe", Component: TeamPage },
      { path: "feedback", Component: FeedbackPage },
      { path: "sources", Component: DataSourcesPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);
