"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔒 รหัสผ่านเข้าหลังบ้าน (เปลี่ยนตรงนี้ได้ตามใจชอบ)
  const ADMIN_PIN = "LUMORA2026"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toUpperCase() === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("ACCESS DENIED: รหัสผ่านไม่ถูกต้อง");
      setPassword("");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }); // เรียงออเดอร์ใหม่ล่าสุดขึ้นก่อน

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // ฟังก์ชันดาวน์โหลดเป็นไฟล์ Excel (CSV)
  const exportToCSV = () => {
    // ใส่ \uFEFF เพื่อให้ Excel อ่านภาษาไทยได้ไม่เพี้ยน
    const csvContent = "\uFEFF" + 
      "Order ID,Date,Customer Name,Phone,Address,Items,Total Amount,Status\n" +
      orders.map(o => {
        const date = new Date(o.created_at).toLocaleString('th-TH');
        const name = `${o.firstName} ${o.lastName}`;
        // ใส่เครื่องหมายคำพูดครอบ Address และ Items เพื่อป้องกันลูกน้ำ (,) ทำให้คอลัมน์เพี้ยน
        return `${o.id},${date},${name},${o.phone},"${o.address} ${o.zipCode}","${o.product_name}",${o.total_amount},${o.status}`;
      }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LUMORA_ORDERS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------- หน้าจอ Login ----------------
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 selection:bg-white selection:text-black">
        <form onSubmit={handleLogin} className="w-full max-w-md space-y-8 border border-white/20 p-10 bg-[#0a0a0a]">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Command Center</h1>
            <p className="text-[10px] tracking-widest text-gray-500 uppercase">Authorized Personnel Only</p>
          </div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ENTER ACCESS PIN" 
            className="w-full bg-transparent border-b border-white/30 py-4 text-center tracking-[0.5em] focus:border-white outline-none transition-colors"
          />
          <button type="submit" className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-xs hover:invert transition-all">
            Unlock
          </button>
        </form>
      </main>
    );
  }

  // ---------------- หน้าจอ Dashboard ----------------
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header & Stats */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">TU LUMORA HQ</h1>
            <p className="text-xs tracking-[0.3em] text-gray-500 mt-2 uppercase">Live Order Tracking</p>
          </div>
          
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] tracking-widest text-gray-500 uppercase">Total Orders</p>
              <p className="text-3xl font-black italic">{orders.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-widest text-gray-500 uppercase">Total Revenue</p>
              <p className="text-3xl font-black italic text-green-400">฿{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <button onClick={fetchOrders} className="text-xs font-bold tracking-widest uppercase border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          <button onClick={exportToCSV} className="text-xs font-black tracking-widest uppercase bg-white text-black px-6 py-2 hover:bg-gray-300 transition-all">
            Export to Excel
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-white/10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#111] text-[10px] tracking-widest uppercase text-gray-400">
              <tr>
                <th className="p-4 border-b border-white/10">Date</th>
                <th className="p-4 border-b border-white/10">Customer</th>
                <th className="p-4 border-b border-white/10">Items</th>
                <th className="p-4 border-b border-white/10">Total</th>
                <th className="p-4 border-b border-white/10">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 uppercase tracking-widest italic">No orders yet. Time to drop the collection.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-500">{new Date(order.created_at).toLocaleDateString('th-TH')}</td>
                    <td className="p-4">
                      <p className="font-bold">{order.firstName} {order.lastName}</p>
                      <p className="text-[10px] text-gray-500">{order.phone}</p>
                    </td>
                    <td className="p-4 font-bold italic">{order.product_name}</td>
                    <td className="p-4 font-black">฿{order.total_amount}</td>
                    <td className="p-4">
                      <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 text-[9px] uppercase tracking-widest font-black">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}