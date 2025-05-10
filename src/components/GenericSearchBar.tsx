import React from "react";
import { Input } from "antd";

interface GenericSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
}

const GenericSearchBar: React.FC<GenericSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  style = {},
  allowClear = true,
}) => {
  return (
    <Input.Search
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSearch={onSearch}
      placeholder={placeholder}
      style={style}
      allowClear={allowClear}
      enterButton
    />
  );
};

export default GenericSearchBar;
