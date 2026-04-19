import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, display: "flex" }}>
        
        {/* Sidebar */}
        <div style={{
          width: "220px",
          background: "#111",
          color: "#fff",
          height: "100vh",
          padding: "20px"
        }}>
          <h2>💰 Finance</h2>

          <p><a href="/dashboard" style={{color:"#fff"}}>Dashboard</a></p>
          <p><a href="/transactions" style={{color:"#fff"}}>Transactions</a></p>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "20px" }}>
          {children}
        </div>

      </body>
    </html>
  );
}