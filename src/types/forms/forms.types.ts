import { Rule } from "antd/es/form";


export interface FormField {
  name: string;
  label: string;
  component: React.ReactNode;
  rules?: Rule[];
  hidden?: boolean;
  valuePropName?: string;
}