import { List, Row, Col } from "antd";
import CardItem from "./CardItem";
import { CardData } from "../types/cards/cards.types";

interface CardListProps<T> {
  data: T[];
  loading?: boolean;
  renderItem: (item: T) => CardData;
}

const CardList = <T,>({ data, loading, renderItem }: CardListProps<T>) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Row justify="center" style={{ width: "100%" }}>
        <Col xs={22} sm={22} md={22} lg={22} xl={22}>
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
              xl: 4,
              xxl: 3,
            }}
            dataSource={data}
            loading={loading}
            renderItem={(item) => {
              const cardData = renderItem(item);
              return (
                <List.Item>
                  <CardItem
                    loading={cardData.loading}
                    title={cardData.title}
                    image={cardData.image}
                    properties={cardData.properties}
                    actions={cardData.actions}
                  />
                </List.Item>
              );
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CardList;
