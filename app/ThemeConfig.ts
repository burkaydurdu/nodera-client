import type { ThemeConfig as AntdThemeConfig } from "antd";
import { lightTheme } from "@/theme/tokens";

const { colors, radius, font } = lightTheme;

/** Ant Design theme derived from theme/tokens.ts — never hardcode colours here. */
const ThemeConfig: AntdThemeConfig = {
  hashed: false,
  token: {
    colorPrimary: colors.brand[600],
    colorInfo: colors.brand[600],
    colorLink: colors.brand[600],
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.danger,
    colorText: colors.text,
    colorTextSecondary: colors.textMuted,
    colorTextTertiary: colors.textMuted,
    colorTextPlaceholder: colors.textMuted,
    colorBorder: colors.border,
    colorBorderSecondary: colors.border,
    colorBgContainer: colors.surface,
    colorBgElevated: colors.surface,
    colorBgLayout: colors.surfaceMuted,
    colorFillSecondary: colors.surfaceRaised,
    borderRadius: radius.input,
    borderRadiusLG: radius.card,
    borderRadiusSM: 6,
    fontFamily: font.sans,
    fontSize: 14,
    controlHeight: 44,
    controlHeightSM: 36,
    controlHeightLG: 52,
    lineWidth: 1,
    boxShadowSecondary: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
  components: {
    Button: {
      borderRadius: radius.button,
      borderRadiusLG: radius.button,
      borderRadiusSM: radius.button,
      fontWeight: 600,
      primaryShadow: "none",
      defaultShadow: "none",
      colorPrimaryHover: colors.brand[700],
      colorPrimaryActive: colors.brand[800],
    },
    Input: {
      borderRadius: radius.input,
      borderRadiusLG: radius.input,
      activeBorderColor: colors.brand[600],
      hoverBorderColor: colors.brand[400],
      activeShadow: `0 0 0 3px ${colors.brand[100]}`,
      paddingInline: 14,
    },
    Select: {
      borderRadius: radius.input,
      borderRadiusLG: radius.input,
      optionSelectedBg: colors.brand[50],
      optionSelectedColor: colors.brand[700],
      activeBorderColor: colors.brand[600],
      hoverBorderColor: colors.brand[400],
      activeOutlineColor: colors.brand[100],
    },
    Checkbox: {
      colorPrimary: colors.brand[600],
      colorPrimaryHover: colors.brand[700],
    },
    Switch: {
      colorPrimary: colors.brand[600],
      colorPrimaryHover: colors.brand[700],
    },
    Modal: {
      borderRadiusLG: radius.card,
      titleFontSize: 18,
    },
    Card: {
      borderRadiusLG: radius.card,
    },
    Menu: {
      itemBorderRadius: radius.button,
      itemSelectedBg: colors.brand[50],
      itemSelectedColor: colors.brand[700],
      itemHoverBg: colors.surfaceRaised,
      itemColor: colors.textMuted,
      itemHeight: 44,
      iconSize: 18,
    },
    Table: {
      headerBg: colors.surfaceRaised,
      headerColor: colors.textMuted,
      borderColor: colors.border,
      rowHoverBg: colors.surfaceRaised,
    },
    Dropdown: {
      borderRadiusLG: radius.input,
    },
    Tag: {
      borderRadiusSM: radius.badge,
    },
    Alert: {
      borderRadiusLG: radius.input,
    },
  },
};

export default ThemeConfig;
