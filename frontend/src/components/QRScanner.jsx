import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../utils/axios.js";

function QRScanner({ eventId }) {
    const scannerRef = useRef(null);
    const [status, setStatus] = useState(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const startScanning = async () => {
        setScanning(true);  
        setStatus(null);

        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: 250 },
                async (decodedText) => {
                    await scannerRef.current.stop();
                    setScanning(false);
                    console.log("Scanned text:", decodedText);

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
        } catch (err) {
            setScanning(false);
            setStatus({ success: false, message: "Camera access denied" });
        }
    };

    const resetScanner = () => {
        setStatus(null);
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

            {status && (
                <div className={`p-4 rounded-lg text-center w-full ${status.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                    <p className="font-medium">{status.message}</p>
                    <button
                        onClick={resetScanner}
                        className="mt-2 text-sm underline"
                    >
                        Scan another
                    </button>
                </div>
            )}
        </div>
    );
}

export default QRScanner;