import React from "react";
import { Layout as AntLayout, theme } from "antd";
import { ThemeAppearance } from "antd-style";
import Header from "../components/Header";
import { items } from "../constants/MenuItems";
import AppRoutes from "../routes/AppRoutes";

const { Content, Footer } = AntLayout;

interface LayoutProps {
  appearance: ThemeAppearance;
  setTheme: (theme: ThemeAppearance) => void;
}

const Layout: React.FC<LayoutProps> = ({ appearance, setTheme }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Header appearance={appearance} setTheme={setTheme} items={items} />
      <Content style={{ padding: "0 48px" }}>
        <div style={{ padding: 10 }} />
        <div
          style={{
            background: colorBgContainer,
            minHeight: 280,
            padding: 24,
            borderRadius: borderRadiusLG,
          }}
        >
          <AppRoutes />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        DGTickets ©{new Date().getFullYear()}
      </Footer>
    </AntLayout>
  );
};

export default Layout;
