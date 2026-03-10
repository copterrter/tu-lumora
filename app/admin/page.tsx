"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from "recharts";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingTracking, setUploadingTracking] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

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
    const csvContent = "\uFEFF" + 
      "Order ID,Date,Customer Name,Phone,Address,Items,Total Amount,Status\n" +
      orders.map(o => {
        const date = new Date(o.created_at).toLocaleString('th-TH');
        const name = `${o.firstName} ${o.lastName}`;
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

  // ฟังก์ชันอัปโหลดไฟล์ Tracking (Excel)
  const handleTrackingUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`คุณต้องการอัปโหลดไฟล์ ${file.name} เพื่อจับคู่เลข Tracking และส่งอีเมลหาลูกค้าใช่หรือไม่?`)) {
      e.target.value = ""; // reset input
      return;
    }

    setUploadingTracking(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-tracking", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      alert(`✅ สำเร็จ!\nจับคู่และอัปเดตไป ${data.details.matchCount} ออเดอร์\nส่งอีเมลสำเร็จ ${data.details.emailCount} ฉบับ`);
      fetchOrders(); // Refresh table
    } catch (err: any) {
      alert(`❌ ผิดพลาด: ${err.message}`);
    } finally {
      setUploadingTracking(false);
      e.target.value = ""; // reset input
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm("ยืนยันการอนุมัติสลิปนี้และเปลี่ยนสถานะออเดอร์เป็นชำระเงินสำเร็จ?")) {
      return;
    }
    setApprovingId(orderId);
    try {
      const res = await fetch("/api/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Approve failed");
      }
      alert("✅ อนุมัติสลิปและอัปเดตสถานะออเดอร์เรียบร้อยแล้ว");
      fetchOrders();
    } catch (err: any) {
      alert(`❌ ผิดพลาด: ${err.message}`);
    } finally {
      setApprovingId(null);
    }
  };

  // 1. ข้อมูลสำหรับกราฟเส้น (Sales vs Visitors)
  const chartData = useMemo(() => {
    if (orders.length === 0) {
      return Array.from({length: 7}).map((_, i) => ({
        date: `Day ${i+1}`,
        sales: Math.floor(Math.random() * 5000),
        visitors: Math.floor(Math.random() * 1000) + 200
      }));
    }

    const dataMap: Record<string, { rawDate: string, date: string, sales: number, visitors: number }> = {};
    orders.forEach(order => {
      const d = new Date(order.created_at);
      const rawDate = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!dataMap[rawDate]) {
        const pseudoRandom = rawDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        dataMap[rawDate] = { rawDate, date: displayDate, sales: 0, visitors: (pseudoRandom % 800) + 200 };
      }
      dataMap[rawDate].sales += order.total_amount;
    });

    return Object.values(dataMap).sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  }, [orders]);

  // 2. ข้อมูลสำหรับกราฟโดนัท (Top Products / Sizes)
  const productData = useMemo(() => {
    if (orders.length === 0) return [{ name: 'N/A', value: 1 }];
    const map: Record<string, number> = {};
    orders.forEach(o => {
      let name = o.product_name || "Unknown";
      // ตัดชื่อให้สั้นลงเพื่อความเป็นระเบียบ (เอา "TU LUMORA" ออก)
      name = name.replace(/TU LUMORA /i, "").trim();
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [orders]);

  const PIE_COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#333333'];

  // 3. ข้อมูลสำหรับกราฟแท่ง (Order Status)
  const statusData = useMemo(() => {
    if (orders.length === 0) return [{ status: 'N/A', count: 0 }];
    const map: Record<string, number> = {};
    orders.forEach(o => {
      const status = o.status || "Unknown";
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [orders]);

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
              <p className="text-3xl font-black italic text-white">฿{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </header>

        {/* 1. Main Line Chart */}
        <div className="w-full h-96 bg-[#0a0a0a] border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
          <div className="flex justify-between items-end mb-6 relative z-10">
            <h2 className="text-[10px] tracking-[0.4em] text-gray-500 uppercase flex items-center gap-4">
              Revenue & Traffic Overview 
              <span className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-white"></span> Sales
              </span>
              <span className="flex items-center gap-2 text-white">
                <span className="w-2 h-2 bg-gray-600"></span> Visitors
              </span>
            </h2>
          </div>

          <div className="h-[280px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="date" stroke="#555" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="left" stroke="#555" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} tickFormatter={(val) => `฿${val}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#555" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', borderRadius: '0px' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff' }} labelStyle={{ color: '#888', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="sales" name="Sales" stroke="#ffffff" strokeWidth={2} dot={{ r: 3, fill: '#000', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#fff', stroke: '#000' }} animationDuration={2000} />
                <Line yAxisId="right" type="monotone" dataKey="visitors" name="Visitors" stroke="#666666" strokeWidth={2} dot={{ r: 3, fill: '#000', stroke: '#666', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#666', stroke: '#000' }} animationDuration={2000} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pie Chart: Product Breakdown */}
          <div className="w-full h-96 bg-[#0a0a0a] border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
            <h2 className="text-[10px] tracking-[0.4em] text-gray-500 uppercase flex items-center gap-4 mb-4 relative z-10">
              Product Breakdown
            </h2>
            <div className="h-[280px] w-full relative z-10 flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={productData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="40%" 
                    innerRadius={70} 
                    outerRadius={90} 
                    paddingAngle={2} 
                    stroke="none"
                    animationDuration={1500}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', borderRadius: '0px' }} 
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', color: '#fff' }} 
                  />
                  <Legend 
                    iconType="square" 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ 
                      fontSize: '10px', 
                      fontFamily: 'monospace', 
                      textTransform: 'uppercase', 
                      paddingTop: '20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: '12px',
                      color: '#aaa'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Order Status */}
          <div className="w-full h-96 bg-[#0a0a0a] border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-700">
            <h2 className="text-[10px] tracking-[0.4em] text-gray-500 uppercase flex items-center gap-4 mb-4 relative z-10">
              Order Status Overview
            </h2>
            <div className="h-[280px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="status" stroke="#555" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#555" tick={{ fill: '#777', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#050505', border: '1px solid #333', borderRadius: '0px' }} 
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }} 
                    cursor={{fill: '#1a1a1a'}} 
                  />
                  <Bar 
                    dataKey="count" 
                    name="Orders"
                    fill="#ffffff" 
                    radius={[2, 2, 0, 0]} 
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <button onClick={fetchOrders} className="text-xs font-bold tracking-widest uppercase border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={`cursor-pointer text-xs font-black tracking-widest uppercase border border-white text-white px-6 py-2 hover:bg-white hover:text-black transition-all text-center ${uploadingTracking ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploadingTracking ? "Processing..." : "Upload Tracking (Excel)"}
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                onChange={handleTrackingUpload}
                disabled={uploadingTracking}
              />
            </label>
            <button onClick={exportToCSV} className="text-xs font-black tracking-widest uppercase bg-white text-black px-6 py-2 hover:bg-gray-300 transition-all">
              Export to Excel
            </button>
          </div>
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
                <th className="p-4 border-b border-white/10">Status / Tracking</th>
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
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-black border ${
                          order.status === 'SHIPPED' 
                            ? 'bg-white text-black border-white' 
                            : order.status === 'pending_manual_verify'
                              ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500'
                              : 'bg-transparent text-gray-400 border-gray-600'
                        }`}>
                          {order.status}
                        </span>
                        {order.tracking_number && (
                          <span className="text-[10px] text-gray-400 font-monospace tracking-widest bg-black/50 px-2 py-1 border border-white/10">
                            {order.tracking_number}
                          </span>
                        )}
                        {order.status === 'pending_manual_verify' && (
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={approvingId === order.id}
                            className="mt-1 text-[9px] uppercase tracking-widest font-black border border-white/40 px-3 py-1 hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {approvingId === order.id ? "Approving..." : "Mark as Paid"}
                          </button>
                        )}
                      </div>
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
