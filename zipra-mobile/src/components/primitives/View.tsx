import React from "react";
import {
  View as RNView,
  Text as RNText,
  type ViewProps,
  type TextProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useAppTheme } from "../theme";
import type { spacing as Spacing, radius as Radius, shadow as Shadow } from "../theme/tokens";

type ViewVariant = "base" | "card" | "surface" | "surfaceAlt" | "brand" | "row" | "center";
type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "title"
  | "body"
  | "label"
  | "caption"
  | "tiny";

type Sp = keyof typeof Spacing;
type Rad = keyof typeof Radius;
type Sh = keyof typeof Shadow.light;

interface ViewExtra {
  variant?: ViewVariant;
  p?: Sp;
  px?: Sp;
  py?: Sp;
  m?: Sp;
  gap?: Sp;
  radius?: Rad;
  shadow?: Sh;
  flex?: boolean;
}

export const View = React.forwardRef<RNView, ViewProps & ViewExtra>(
  ({ variant, p, px, py, m, gap, radius: r, shadow: sh, flex, style, ...rest }, ref) => {
    const { color, spacing: sp, radius: rad, shadow: shd } = useAppTheme();
    const base: ViewStyle = {};
    if (variant === "card") {
      base.backgroundColor = color.card;
      base.borderRadius = rad.lg;
      base.borderWidth = 1;
      base.borderColor = color.border;
      base.shadowColor = "#000";
      base.shadowOpacity = 0.06;
      base.shadowRadius = 12;
      base.shadowOffset = { width: 0, height: 4 };
      base.elevation = 3;
    } else if (variant === "surface") base.backgroundColor = color.surface;
    else if (variant === "surfaceAlt") base.backgroundColor = color.surfaceAlt;
    else if (variant === "brand") base.backgroundColor = color.primary;
    if (p !== undefined) base.padding = sp[p];
    if (px !== undefined) base.paddingHorizontal = sp[px];
    if (py !== undefined) base.paddingVertical = sp[py];
    if (m !== undefined) base.margin = sp[m];
    if (gap !== undefined) base.gap = sp[gap];
    if (r !== undefined) base.borderRadius = rad[r];
    if (sh !== undefined) {
      base.shadowColor = "#000";
      base.shadowOpacity = sh === "brand" ? 0.28 : 0.1;
      base.shadowRadius = sh === "lg" ? 28 : sh === "md" ? 14 : 6;
      base.shadowOffset = { width: 0, height: sh === "sm" ? 2 : 6 };
      base.elevation = sh === "lg" ? 8 : sh === "md" ? 5 : 2;
    }
    if (flex) base.flex = 1;

    const composed: StyleProp<ViewStyle> = [base, style];
    return <RNView ref={ref} style={composed} {...rest} />;
  }
);
View.displayName = "View";

interface TextExtra {
  variant?: TextVariant;
  color?: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  flex?: boolean;
}

export const Text = React.forwardRef<RNText, TextProps & TextExtra>(
  ({ variant = "body", color, align, bold, style, ...rest }, ref) => {
    const { color: c, fontSize: fs } = useAppTheme();
    const variants: Record<TextVariant, TextStyle> = {
      h1: { fontSize: fs["3xl"], fontWeight: "800", lineHeight: fs["3xl"] * 1.15 },
      h2: { fontSize: fs["2xl"], fontWeight: "800", lineHeight: fs["2xl"] * 1.15 },
      h3: { fontSize: fs.xl, fontWeight: "700", lineHeight: fs.xl * 1.2 },
      title: { fontSize: fs.lg, fontWeight: "700", lineHeight: fs.lg * 1.25 },
      body: { fontSize: fs.base, fontWeight: "400", lineHeight: fs.base * 1.45 },
      label: { fontSize: fs.sm, fontWeight: "600", lineHeight: fs.sm * 1.3 },
      caption: { fontSize: fs.sm, fontWeight: "400", color: c.textSecondary },
      tiny: { fontSize: fs.xs, fontWeight: "500", color: c.textTertiary },
    };
    const resolved: TextStyle = {
      ...variants[variant],
      color: color ?? (variant === "caption" || variant === "tiny" ? c.textSecondary : c.text),
    };
    if (align) resolved.textAlign = align;
    if (bold) resolved.fontWeight = "700";
    return <RNText ref={ref} style={[resolved, style]} {...rest} />;
  }
);
Text.displayName = "Text";
