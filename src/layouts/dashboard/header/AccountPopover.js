import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// @mui
import { alpha } from "@mui/material/styles";
import {
  Box,
  Divider,
  Typography,
  Stack,
  MenuItem,
  Avatar,
  IconButton,
  Popover,
} from "@mui/material";
// mocks_
import account from "../../../_mock/account";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------



// ----------------------------------------------------------------------

export default function AccountPopover() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [adminInfo, setAdminInfo] = useState({});
  const [open, setOpen] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const MENU_OPTIONS = [
    {
      label: t("Home"),
      icon: "eva:home-fill",
    },
    {
      label: t("Profile"),
      icon: "eva:person-fill",
    },
    // {
    //   label: "Settings",
    //   icon: "eva:settings-2-fill",
    // },
  ];

  const handleClose = () => {
    setOpen(null);
  };

  const fnLogOut = async () => {
    await localStorage.clear();
    navigate("/login");
    window.location.reload();
    setOpen(null);
  };

  useEffect(() => {
    const daataa = localStorage.getItem("adminInfo");
    setAdminInfo(JSON.parse(daataa));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            "&:before": {
              zIndex: 1,
              content: "''",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              position: "absolute",
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={account.photoURL} alt="photoURL" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            "& .MuiMenuItem-root": {
              typography: "body2",
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {adminInfo?.full_name}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
            {adminInfo?.username}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem
              key={option.label}
              onClick={() => {
                if (option.label === "Profile") {
                  navigate("/dashboard/profile");
                }
                handleClose();
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        <MenuItem onClick={() => fnLogOut()} sx={{ m: 1 }}>
          {t("Logout")}
        </MenuItem>
      </Popover>
    </>
  );
}
