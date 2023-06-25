import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../auth/userSlice";
import "./Landing.css";

import { AppBar, Button, Grid, Toolbar, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import YouTubeIcon from "@mui/icons-material/YouTube";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import InfoIcon from "@mui/icons-material/Info";

import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import ParticlesConfig from "./particle-config";
import backgroundImage from "../../media/landing4.jpg";
import SwipeableTextMobileStepper from './play'

export const Landing = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  // Particles 背景那个互动的东西; Grid 网格布局; APPBar是页面最上方的任务栏; toolBar是任务栏中控制组件的位置
  return (
    <>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={ParticlesConfig}
      />
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        style={{
          zIndex: 999,
          backgroundImage: `url(${backgroundImage})`, 
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          width: "100vw", 
          height: "100vh",
        }}
      >
        <Grid
          container
          item
          justifyContent="center"
          alignItems="center"
          direction="column"
          style={{ width: "50%", display: "flex", flexDirection: "column", paddingLeft: "3rem"}}
          spacing={2}
        >
          <Grid container item spacing={2} direction="row" justifyContent="center">
            <Grid item >
              <h1>CollabKG</h1>
            </Grid>
            <Grid item>
              <h3 style={{ fontWeight: "normal" }}>
              A Learnable Human-Machine-Cooperative Information Extraction Toolkit for (Event) Knowledge Graph Construction.
              </h3>
            </Grid>
          </Grid>
          <Grid container item direction="row" justifyContent="center">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "25%"
              }}
            >
              <Button
                variant="contained"
                color="primary"
                href={isAuthenticated ? "/feed" : "/login"}
                sx={{
                  ":hover": {
                    bgcolor: "primary.light", // theme.palette.primary.main
                    color: "white",
                  },
                  textAlign: "left",
                }}
                endIcon={isAuthenticated ? <ArrowForwardIosIcon /> : null}
              >
                {isAuthenticated ? "Enter" : "Login"}
              </Button>
              {!isAuthenticated && (
                <span
                  style={{
                    textAlign: "right",
                    marginRight: "0.5rem",
                    color: "#263238",
                  }}
                >
                  or{" "}
                  <a
                    style={{
                      color: "#263238",
                    }}
                    href="/signup"
                  >
                    <strong style={{ cursor: "pointer" }}>sign up</strong>
                  </a>
                </span>
              )}
            </div>
          </Grid>
        </Grid>
        <Grid container item alignItems="center" justifyContent="center" style={{ width: "50%", display: "flex", flexDirection: "column" }}>
          <AppBar position="fixed" elevation={0} style={{ background: "none" }}>
            <Toolbar style={{ display: "flex", justifyContent: "right" }}>
              <div style={{ display: "flex" }}>
                <IconButton
                  href="https://github.com/cocacola-lab/CollabKG"
                  target="_blank"
                  rel="noreferrer"
                  alt="Github repository"
                >
                  <GitHubIcon fontSize="large" color="secondary" id="github" />
                </IconButton>
                <IconButton
                  href="https://youtu.be"
                  target="_blank"
                  rel="noreferrer"
                  alt="YouTube demonstration video"
                >
                  <YouTubeIcon
                    fontSize="large"
                    color="secondary"
                    id="youtube"
                  />
                </IconButton>
                <IconButton
                  href="https://github.com/cocacola-lab/CollabKG/blob/main/README.md"
                  target="_blank"
                  rel="noreferrer"
                  alt="CollabKG About Page"
                >
                  <InfoIcon
                    fontSize="large"
                    color="secondary"
                    id="information"
                  />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          <SwipeableTextMobileStepper />
        </Grid>
      </Grid>
    </>
  );
};
