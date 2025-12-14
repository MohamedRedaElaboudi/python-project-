import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  Badge,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import EventIcon from "@mui/icons-material/Event";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DarkModeIcon from "@mui/icons-material/DarkMode";

const drawerWidth = 260;

export default function StudentLayout() {
  const nav = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const savedDark = localStorage.getItem("darkMode");
    if (savedDark) setDarkMode(savedDark === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const logout = () => {
    localStorage.clear();
    nav("/login");
  };

  const menuItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/student/dashboard" },
    { label: "Upload Rapport", icon: <UploadFileIcon />, path: "/student/upload" },
    { label: "Mes Rapports", icon: <DescriptionIcon />, path: "/student/mes-rapports" },
    { label: "Soutenance", icon: <EventIcon />, path: "/student/soutenance" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#0B1220" : "#FFFFFF",
        color: darkMode ? "#E5E7EB" : "#111827",
      }}
    >
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            backgroundColor: darkMode ? "#020617" : "#F5F6F8",
            borderRight: "1px solid",
            borderColor: darkMode ? "#1F2937" : "#E5E7EB",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography fontWeight="bold">🎓 Espace Étudiant</Typography>
        </Box>

        <List>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <ListItemButton
                key={item.label}
                onClick={() => nav(item.path)}
                sx={{
                  mx: 2,
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: active
                    ? darkMode
                      ? "#1E3A8A"
                      : "#E0ECFF"
                    : "transparent",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active
                      ? darkMode
                        ? "#BFDBFE"
                        : "#2563EB"
                      : darkMode
                      ? "#9CA3AF"
                      : "#6B7280",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1 }}>
        {/* TOP BAR */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: darkMode ? "#0B1220" : "#FFFFFF",
            borderBottom: "1px solid",
            borderColor: darkMode ? "#1F2937" : "#E5E7EB",
            color: darkMode ? "#E5E7EB" : "#111827",
          }}
        >
          <Toolbar sx={{ justifyContent: "flex-end", gap: 2 }}>
            <IconButton onClick={() => setDarkMode(!darkMode)}>
              <DarkModeIcon />
            </IconButton>

            <Badge badgeContent={1} color="error">
              <NotificationsIcon />
            </Badge>

            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: darkMode ? "#1E3A8A" : "#2563EB" }}>
                🎓
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography fontWeight="bold">
                  {user?.prenom} {user?.name}
                </Typography>
                <Typography fontSize={13} color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={logout} sx={{ color: "error.main" }}>
                Déconnexion
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* PAGE – FIX DARK MODE */}
        <Box
          sx={{
            p: 4,
            minHeight: "calc(100vh - 64px)",
            backgroundColor: darkMode ? "#0F172A" : "#FFFFFF",

            "& .MuiCard-root": {
              backgroundColor: darkMode ? "#111827" : "#FFFFFF",
              color: darkMode ? "#E5E7EB" : "#111827",
              borderRadius: 3,
            },

            "& .MuiTypography-colorTextSecondary": {
              color: darkMode ? "#9CA3AF" : "#6B7280",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
