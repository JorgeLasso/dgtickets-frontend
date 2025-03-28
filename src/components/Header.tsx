import React from "react";
import { Layout, Menu } from "antd";
import { Segmented } from "antd";
import { ThemeAppearance } from "antd-style";
import { useLocation } from "react-router";

const { Header: AntHeader } = Layout;

const options = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
];

interface HeaderProps {
  appearance: ThemeAppearance;
  setTheme: (theme: ThemeAppearance) => void;
  items: { key: string; label: React.ReactNode }[];
}

const Header: React.FC<HeaderProps> = ({ appearance, setTheme, items }) => {
  const location = useLocation();

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="demo-logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
        style={{ flex: 1, minWidth: 0 }}
        items={items}
      />
      <Segmented
        options={options}
        value={appearance}
        onChange={(value) => setTheme(value as ThemeAppearance)}
        style={{ marginLeft: "auto" }}
      />
    </AntHeader>
  );
};

export default Header;
