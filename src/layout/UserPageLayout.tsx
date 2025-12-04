import { Box } from "@mui/material";
import AppNavbar from "../components/AppNavBar";

interface Props {
  children: React.ReactNode;
}

export default function UserPageLayout({ children }: Props) {
  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh" }}>
      <AppNavbar />
      <Box sx={{ py: 3 }}>{children}</Box>
    </Box>
  );
}
