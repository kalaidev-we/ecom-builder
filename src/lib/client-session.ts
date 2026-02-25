export const ensureGuestSession = async () => {
  await fetch("/api/session/guest", {
    method: "POST",
    credentials: "include",
  });
};
