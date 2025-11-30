import {
  Typography,
  Box,
  Container,
  Card,
  CardMedia,
  CardContent,
  Grid,
} from "@mui/material";

import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import AlbumIcon from "@mui/icons-material/Album";
import StyleIcon from "@mui/icons-material/Style";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import { useState } from "react";
import AppNavbar from "../components/AppNavBar";
import AnimatedButton from "../components/Button";
import AuthModal from "./AuthModal";

const categories = [
  { name: "Sneakers", icon: <DirectionsRunIcon sx={{ fontSize: 75 }} /> },
  { name: "Trading Cards", icon: <StyleIcon sx={{ fontSize: 75 }} /> },
  { name: "Video Games", icon: <SportsEsportsIcon sx={{ fontSize: 75 }} /> },
  { name: "Music", icon: <AlbumIcon sx={{ fontSize: 75 }} /> },
  { name: "Retro Tech", icon: <AlbumIcon sx={{ fontSize: 75 }} /> },
  { name: "Luxury Watches", icon: <StyleIcon sx={{ fontSize: 75 }} /> },
  { name: "Comics", icon: <SportsEsportsIcon sx={{ fontSize: 75 }} /> },
  { name: "Antiques", icon: <DirectionsRunIcon sx={{ fontSize: 75 }} /> },
  { name: "Cameras", icon: <AlbumIcon sx={{ fontSize: 75 }} /> },
  { name: "Art Prints", icon: <StyleIcon sx={{ fontSize: 75 }} /> },
  { name: "Toys", icon: <SportsEsportsIcon sx={{ fontSize: 75 }} /> },
  { name: "Cards & Stamps", icon: <DirectionsRunIcon sx={{ fontSize: 75 }} /> },
];

export default function Home() {
  const [showAll, setShowAll] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  return (
    <Box sx={{ bgcolor: "#fff", minHeight: "100vh", width: "100%" }}>
      <AppNavbar />
      <Container sx={{ textAlign: "center", py: 10 }}>
        <Typography variant="h3" fontWeight={700} mb={2}>
          Buy and sell collectibles
        </Typography>
        <Typography
          variant="h6"
          color="gray"
          sx={{ maxWidth: 550, mx: "auto", mb: 4 }}
        >
          Collector is the perfect marketplace for rare and unique collectibles.
        </Typography>
        <AnimatedButton
          label="Sign Up"
          onClick={() => {
            setAuthMode("register");
            setOpenAuth(true);
          }}
        />{" "}
      </Container>
      <Container sx={{ pb: 8 }}>
        <Typography
          variant="h5"
          sx={{ color: "black" }}
          fontWeight={700}
          mb={3}
        >
          Latest Articles
        </Typography>

        <Grid container spacing={6}>
          {[
            {
              title: "Air Max 1",
              price: "$250.00",
              author: "jdoe",
              img: "/img/airmax.png",
            },
            {
              title: "Spider-Man Print",
              price: "$35.00",
              author: "collectingguru",
              img: "/img/spiderman.png",
            },
            {
              title: "Super NES",
              price: "$150.00",
              author: "16bitfan",
              img: "/img/snes.png",
            },
            {
              title: "Beatles Vinyl",
              price: "$50.00",
              author: "retrolove",
              img: "/img/vinyl.png",
            },
          ].map((item, i) => (
            <Grid key={i}>
              <Card
                sx={{
                  width: 250,
                  height: 310,
                  borderRadius: 2,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardMedia
                  component="img"
                  image={item.img}
                  sx={{ height: 180, objectFit: "cover" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography fontWeight={600}>{item.title}</Typography>
                  <Typography>{item.price}</Typography>
                  <Typography fontSize={13} color="gray">
                    by {item.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Container sx={{ pb: 10 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography sx={{ color: "black" }} variant="h5" fontWeight={700}>
            Browse by Category
          </Typography>

          <AnimatedButton
            label={showAll ? "Show Less" : "View All"}
            variant="text"
            onClick={() => setShowAll(!showAll)}
          />
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {(showAll ? categories : categories.slice(0, 5)).map((cat, i) => (
            <Grid key={i}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: "3px solid #1e4fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 1,
                    color: "#1e4fff",
                  }}
                >
                  {cat.icon}
                </Box>
                <Typography fontWeight={600}>{cat.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      <AuthModal
        open={openAuth}
        onClose={() => setOpenAuth(false)}
        mode={authMode}
        setMode={setAuthMode}
      />
    </Box>
  );
}
