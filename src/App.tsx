import Layout from "./layouts/Layout";
import { ThemeProvider, ThemeAppearance } from "antd-style";
import { useState } from "react";
import { UiProvider } from "./context/UiContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./auth/AuthContext";
import { HeadquarterProvider } from "./context/HeadquarterContext";

function App() {
  const [appearance, setTheme] = useState<ThemeAppearance>("light");
  return (
    <UiProvider>
      <NotificationProvider>
        <AuthProvider>
          <HeadquarterProvider>
            <ThemeProvider appearance={appearance}>
              <Layout appearance={appearance} setTheme={setTheme} />
            </ThemeProvider>
          </HeadquarterProvider>
        </AuthProvider>
      </NotificationProvider>
    </UiProvider>
  );
}

export default App;
