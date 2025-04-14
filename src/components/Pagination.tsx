import React from "react";
import { Pagination as AntPagination } from "antd";

interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showSizeChanger?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  pageSize,
  onChange,
  showSizeChanger = false,
}) => {
  return (
    <div
      style={{
        marginTop: 24,
        marginBottom: 24,
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <AntPagination
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={showSizeChanger}
        responsive
      />
    </div>
  );
};

export default Pagination;
