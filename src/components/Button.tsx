import { Button } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { ReactNode } from "react";

interface Props {
  label?: string;
  onClick?: () => void;
  color?: string;
  width?: number | string;
  height?: number | string;
  variant?: "contained" | "outlined" | "text";
  showArrow?: boolean;
  children?: ReactNode;
  sx?: object;
}

export default function AnimatedButton({
  label,
  onClick,
  color = "#1e4fff",
  width = 130,
  height = 45,
  variant = "contained",
  showArrow = true,
  children,
  sx = {},
}: Props) {
  return (
    <Button
      disableRipple
      onClick={onClick}
      variant={variant}
      endIcon={
        variant === "text" && showArrow ? <ChevronRightIcon /> : undefined
      }
      sx={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.4,
        whiteSpace: "nowrap",
        borderRadius: "50px",
        fontWeight: 600,
        fontSize: 16,
        textTransform: "none",

        transition: "transform 0.07s ease-in-out",
        "&:active": { transform: "scale(0.985)" },

        "&:focus": { outline: "none" },
        "&:focus-visible": { outline: "none" },
        "&.MuiButton-root": {
          boxShadow: "none !important",
          outline: "none !important",
        },

        ...(variant === "contained" && {
          backgroundColor: color,
          color: "#fff",
          "&:hover": { backgroundColor: color, transform: "scale(1.02)" },
        }),

        ...(variant === "outlined" && {
          borderColor: color,
          color: color,
          "&:hover": { opacity: 0.9, transform: "scale(1.02)" },
        }),

        ...(variant === "text" && {
          color: color,
          "&:hover": {
            backgroundColor: "transparent",
            transform: "scale(1.02)",
          },
        }),

        ...sx,
      }}
    >
      {children ?? label}
    </Button>
  );
}
