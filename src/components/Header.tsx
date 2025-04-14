import React, { useContext, useState } from "react";
import { Layout, Menu, Button, Space, Typography, Drawer } from "antd";
import {
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Segmented } from "antd";
import { ThemeAppearance } from "antd-style";
import { useLocation } from "react-router";
import { AuthContext } from "../auth/AuthContext";
import { ROLES } from "../constants/Roles";
import { useMediaQuery } from "react-responsive";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const options = [
  {
    label: <SunOutlined />,
    value: "light",
  },
  {
    label: <MoonOutlined />,
    value: "dark",
  },
];

interface HeaderProps {
  appearance: ThemeAppearance;
  setTheme: (theme: ThemeAppearance) => void;
  items: { key: string; label: React.ReactNode }[];
}

const Header: React.FC<HeaderProps> = ({ appearance, setTheme, items }) => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const filteredItems = items.filter((item) => {
    if (item.key === "/tickets") {
      return true;
    }

    if (!authContext || !authContext.auth.isLoggedIn) {
      return item.key === "/login" || item.key === "/registro";
    }

    const userRole = authContext.auth.role;

    if (item.key === "/crear") {
      return userRole === ROLES.ADMIN || userRole === ROLES.ADVISER;
    }

    if (item.key === "/asesor/ingresar") {
      return userRole === ROLES.ADVISER;
    }

    if (item.key === "/login" || item.key === "/registro") {
      return false;
    }

    return true;
  });

  const handleLogout = () => {
    if (authContext) {
      authContext.logout();
      window.location.reload();
    }
  };

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        padding: isMobile ? "0 15px" : undefined,
      }}
    >
      <div className="demo-logo" />

      {isMobile ? (
        <>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            style={{ color: "white" }}
          />
          <Drawer
            title="Menú"
            placement="left"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            styles={{ body: { padding: 0 } }}
          >
            <Menu
              mode="vertical"
              selectedKeys={[location.pathname]}
              items={filteredItems}
              onClick={() => setMobileMenuOpen(false)}
            />
          </Drawer>
        </>
      ) : (
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1, minWidth: 0 }}
          items={filteredItems}
        />
      )}

      <Space
        style={{
          marginLeft: "auto",
          marginRight: isMobile ? "0" : "10px",
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}
      >
        {authContext && authContext.auth.isLoggedIn && (
          <>
            <Text
              style={{
                color: "white",
                display: "block",
                marginRight: isMobile ? 5 : 10,
              }}
            >
              {`Hola, ${authContext.auth.firstName || ""}`}
            </Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              type="text"
              danger
              size={isMobile ? "small" : "middle"}
            >
              {!isMobile && "Salir"}
            </Button>
          </>
        )}
        <Segmented
          options={options}
          value={appearance}
          onChange={(value) => setTheme(value as ThemeAppearance)}
          style={{
            backgroundColor: "#001529",
            color: "white",
            scale: isMobile ? "0.8" : "1",
          }}
        />
      </Space>
    </AntHeader>
  );
};

export default Header;
