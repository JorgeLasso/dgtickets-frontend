import Layout from "./layouts/Layout";
import { ThemeProvider, ThemeAppearance } from "antd-style";
import { useState } from "react";
import { UiProvider } from "./context/UiContext";

function App() {
  const [appearance, setTheme] = useState<ThemeAppearance>("light");
  return (
    <UiProvider>
      <ThemeProvider appearance={appearance}>
        <Layout appearance={appearance} setTheme={setTheme} />
      </ThemeProvider>
    </UiProvider>
  );
}

export default App;
