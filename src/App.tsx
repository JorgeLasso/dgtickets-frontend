import Layout from "./layouts/Layout";
import { ThemeProvider, ThemeAppearance } from "antd-style";
import { useState } from "react";
import { UiProvider } from "./context/UiContext";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./auth/AuthContext";

function App() {
  const [appearance, setTheme] = useState<ThemeAppearance>("light");
  return (
    <UiProvider>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider appearance={appearance}>
            <Layout appearance={appearance} setTheme={setTheme} />
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </UiProvider>
  );
}

export default App;
