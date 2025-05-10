import React from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload";
import { UploadFileStatus } from "antd/es/upload/interface";

const FileUploader: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const getBase64 = (file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const beforeUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Solo puedes subir archivos JPG/PNG!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("La imagen debe ser menor a 2MB!");
      return Upload.LIST_IGNORE;
    }

    try {
      const base64 = await getBase64(file);
      if (onChange) {
        onChange(base64);
      }
    } catch (error) {
      console.error("Error al convertir a base64:", error);
      message.error("Error al procesar la imagen");
    }

    return false;
  };
  const fileList: UploadFile[] = value
    ? [
        {
          uid: "-1",
          name: "imagen.png",
          status: "done" as UploadFileStatus,
          url: value,
          thumbUrl: value,
        },
      ]
    : [];

  return (
    <Upload
      name="file"
      listType="picture"
      showUploadList={true}
      beforeUpload={beforeUpload}
      maxCount={1}
      fileList={fileList}
      onRemove={() => {
        if (onChange) {
          onChange("");
        }
      }}
    >
      {!value && <Button icon={<UploadOutlined />}>Seleccionar archivo</Button>}
    </Upload>
  );
};

export default FileUploader;
