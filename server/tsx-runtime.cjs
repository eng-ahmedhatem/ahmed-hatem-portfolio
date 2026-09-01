// Some restricted Windows hosts can make os.userInfo() fail before tsx starts.
// Supplying the standard Unix-style uid hook lets tsx choose a safe temp name.
if (typeof process.geteuid !== "function") {
  Object.defineProperty(process, "geteuid", { value: () => 0 });
}
