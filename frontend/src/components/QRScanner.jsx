import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../utils/axios.js";

function QRScanner({ eventId }) {
  const scannerRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // ignore if never started
        }
      }
    };
  }, []);

  const startScanning = async () => {
    setScanning(true);
    setStatus(null);

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);

          try {
            const { qrToken, eventId: scannedEventId } = JSON.parse(decodedText);

            if (scannedEventId !== eventId) {
              setStatus({ success: false, message: "QR is for a different event" });
              return;
            }

            const res = await api.post("/attendance/mark", { qrToken, eventId });
            setStatus({ success: true, message: res.data.message });
          } catch (err) {
            setStatus({
              success: false,
              message: err.response?.data?.message || "Invalid QR code",
            });
          }
        }
      );
    } catch {
      setScanning(false);
      setStatus({ success: false, message: "Camera access denied" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-lg font-medium text-gray-800">QR Attendance Scanner</h2>

      <div id="qr-reader" className="w-72 h-72 border-2 border-indigo-400 rounded-xl overflow-hidden" />

      {!scanning && !status && (
        <button
          onClick={startScanning}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Start Scanning
        </button>
      )}

      {scanning && (
        <p className="text-sm text-gray-400">Scanning... point at a QR code</p>
      )}

      {status && (
        <div className={`p-4 rounded-lg text-center w-full ${status.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <p className="font-medium">{status.message}</p>
          <button onClick={() => setStatus(null)} className="mt-2 text-sm underline">
            Scan another
          </button>
        </div>
      )}
    </div>
  );
}

export default QRScanner;