export const getErrorMessage = (err: any): string => {
  console.log("FULL ERROR:", err);

  return (
    err?.error?.errors?.[0] ||
    err?.response?.data?.error?.errors?.[0] ||  // Rails nested
    err?.response?.data?.errors?.[0] ||         // Rails direct
    err?.response?.data?.error?.message ||      // nested message
    err?.response?.data?.message ||             // generic message
    err?.message ||                             // JS error
    "Something went wrong"
  );
};
