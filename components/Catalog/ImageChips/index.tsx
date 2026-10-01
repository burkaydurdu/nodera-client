import { Tag } from "antd";
import type { ImageChipsProps } from "./type";

export default function ImageChips({ codes, images }: ImageChipsProps) {
  const nameOf = (code: string) => images.find((image) => image.code === code)?.name ?? code;

  return (
    <div className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <Tag key={code} className="m-0 rounded-badge">
          {nameOf(code)}
        </Tag>
      ))}
    </div>
  );
}
