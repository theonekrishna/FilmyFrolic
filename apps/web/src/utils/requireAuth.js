export const requireAuth = (navigate, path) => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    navigate("/login", { state: { from: path } });
    return false;
  }

  return true;
};
