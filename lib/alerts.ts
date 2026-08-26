import Swal from "sweetalert2";

// Helper to check if dark mode is currently active
const isDarkMode = () => {
  if (typeof window === "undefined") return false;
  return document.documentElement.classList.contains("dark");
};

// Common theme colors
const getThemeColors = () => {
  const dark = isDarkMode();
  return {
    background: dark ? "#1e293b" : "#ffffff",
    color: dark ? "#f8fafc" : "#1e293b",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#64748b",
  };
};

export const showToast = (
  icon: "success" | "error" | "warning" | "info",
  title: string
) => {
  const theme = getThemeColors();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: theme.background,
    color: theme.color,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

export const confirmDelete = async (itemName: string = "this entry") => {
  const theme = getThemeColors();
  return Swal.fire({
    title: "Are you sure?",
    text: `Do you want to delete "${itemName}"?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: theme.cancelButtonColor,
    background: theme.background,
    color: theme.color,
    reverseButtons: true,
  });
};

export const confirmSignOut = async () => {
  const theme = getThemeColors();
  return Swal.fire({
    title: "Sign Out?",
    text: "Are you sure you want to log out of your account?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Sign Out",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: theme.cancelButtonColor,
    background: theme.background,
    color: theme.color,
    reverseButtons: true,
  });
};

export const showErrorAlert = (title: string, message: string) => {
  const theme = getThemeColors();
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: theme.confirmButtonColor,
    background: theme.background,
    color: theme.color,
  });
};
