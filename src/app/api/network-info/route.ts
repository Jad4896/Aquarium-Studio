import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
  try {
    const interfaces = os.networkInterfaces();
    const addresses: { name: string; ip: string }[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          addresses.push({ name, ip: net.address });
        }
      }
    }

    // Find best local IP (prefer 192.168.x or 10.x or first non-internal)
    const preferred =
      addresses.find((a) => a.ip.startsWith("192.168.") || a.ip.startsWith("10.")) ||
      addresses[0];

    const primaryIp = preferred ? preferred.ip : "192.168.1.xxx";
    const port = process.env.PORT || 3000;

    return NextResponse.json({
      success: true,
      primaryIp,
      port,
      fullUrl: `http://${primaryIp}:${port}`,
      allAddresses: addresses,
    });
  } catch (err) {
    console.error("Error retrieving network info:", err);
    return NextResponse.json(
      {
        success: false,
        primaryIp: "localhost",
        port: 3000,
        fullUrl: "http://localhost:3000",
      },
      { status: 500 }
    );
  }
}
