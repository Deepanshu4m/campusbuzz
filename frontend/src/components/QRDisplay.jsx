function QRDisplay({ qrCode, eventTitle }) {
  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 rounded-xl">
      <h2 className="text-lg font-medium text-gray-800">Your Entry QR Code</h2>
      <p className="text-sm text-gray-500">{eventTitle}</p>
      <img
        src={qrCode}
        alt="QR Code"
        className="w-48 h-48"
      />
      <p className="text-xs text-gray-400 text-center">
        Show this QR code at the event entrance
      </p>
    </div>
  );
}

export default QRDisplay;