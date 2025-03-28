import os from "os";

export function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const { family, address, internal } of iface || []) {
      if (family === "IPv4" && !internal) {
        return address;
      }
    }
  }
  return "localhost";
}
