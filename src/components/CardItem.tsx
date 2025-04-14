import React, { ReactNode } from "react";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Card } from "antd";
import { ItemProperty } from "../types/cards/cards.types";

export interface CardItemProps {
  loading?: boolean;
  title?: string;
  children?: ReactNode;
  image?: string;
  properties?: ItemProperty[];
  actions?: ReactNode[];
}

const CardItem: React.FC<CardItemProps> = ({
  loading = false,
  title = "Card title",
  children,
  image = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png",
  properties,
  actions = [
    <SettingOutlined key="setting" />,
    <EditOutlined key="edit" />,
    <EllipsisOutlined key="ellipsis" />,
  ],
}) => (
  <Card
    type="inner"
    variant="borderless"
    loading={loading}
    title={title}
    style={{ width: "100%", maxWidth: 300, margin: "0 auto" }}
    cover={<img alt="img" src={image} />}
    actions={actions}
  >
    {properties && properties.length > 0 ? (
      <div>
        {properties.map((prop, index) => (
          <p key={index}>
            <strong>{prop.label}:</strong> {prop.value}
          </p>
        ))}
      </div>
    ) : (
      <h3>{children}</h3>
    )}
  </Card>
);

export default CardItem;
