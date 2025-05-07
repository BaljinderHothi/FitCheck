import Navbar from "./navbar";

export default function MainLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-zinc-900 text-white overflow-hidden rounded-lg">
      <Navbar />

      {children}
    </div>
  );
}
