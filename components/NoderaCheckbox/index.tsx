"use client";

import { Checkbox } from "antd";
import classNames from "classnames";
import type { NoderaCheckboxProps } from "./type";

export default function NoderaCheckbox({ className, ...rest }: NoderaCheckboxProps) {
  return <Checkbox className={classNames("text-sm text-text", className)} {...rest} />;
}
