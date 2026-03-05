import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResource } from "../../hooks/useResource";

// ── Types ──
interface ApiBooking {
    id: string;
    customer_name: string;
    service_name: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
    total_amount: string | number;
    created_at: string;
}

interface DashboardStats {
    pending_bookings: number;
    completed_bookings: number;
    upcoming_bookings_count: number;
}

// ── Mock Fallback Data ──
const MOCK_BOOKINGS = [
    { id: "1", customerName: "Priya Sharma", serviceName: "Bridal Makeup Package", bookingDate: "Mar 5, 2026", startTime: "9:00 AM", endTime: "12:00 PM", status: "confirmed", totalAmount: 15000, createdAt: "Mar 3, 2026", avatarInitials: "PS" },
    { id: "2", customerName: "Ananya Verma", serviceName: "Party Makeup", bookingDate: "Mar 5, 2026", startTime: "4:00 PM", endTime: "5:30 PM", status: "pending", totalAmount: 3500, createdAt: "Mar 4, 2026", avatarInitials: "AV" },
    { id: "3", customerName: "Meera Patel", serviceName: "Pre-Wedding Shoot Makeup", bookingDate: "Mar 6, 2026", startTime: "6:00 AM", endTime: "8:00 AM", status: "confirmed", totalAmount: 8000, createdAt: "Mar 3, 2026", avatarInitials: "MP" },
    { id: "4", customerName: "Sneha Reddy", serviceName: "Engagement Look", bookingDate: "Mar 8, 2026", startTime: "11:00 AM", endTime: "1:00 PM", status: "confirmed", totalAmount: 12000, createdAt: "Mar 2, 2026", avatarInitials: "SR" },
    { id: "5", customerName: "Kavya Singh", serviceName: "Hair Styling", bookingDate: "Feb 28, 2026", startTime: "3:00 PM", endTime: "4:00 PM", status: "completed", totalAmount: 2500, createdAt: "Feb 25, 2026", avatarInitials: "KS" },
    { id: "6", customerName: "Ritu Agarwal", serviceName: "Natural Makeup", bookingDate: "Feb 27, 2026", startTime: "10:00 AM", endTime: "11:00 AM", status: "completed", totalAmount: 2000, createdAt: "Feb 24, 2026", avatarInitials: "RA" },
    { id: "7", customerName: "Deepika Nair", serviceName: "Mehendi Function Makeup", bookingDate: "Feb 25, 2026", startTime: "5:00 PM", endTime: "6:30 PM", status: "cancelled", totalAmount: 4500, createdAt: "Feb 22, 2026", avatarInitials: "DN" },
];

const MOCK_SUMMARY = { upcoming_bookings_count: 3, pending_bookings: 2, completed_bookings: 2 };

const STATUS_FILTERS = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

const STATUS_COLORS: Record<string, { text: string; dot: string; bg: string }> = {
    confirmed: { text: "#22c55e", dot: "#22c55e", bg: "rgba(34, 197, 94, 0.1)" },
    pending: { text: "#f59e0b", dot: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
    completed: { text: "#06b6d4", dot: "#06b6d4", bg: "rgba(6, 182, 212, 0.1)" },
    cancelled: { text: "#ef4444", dot: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
};

function formatDate(dateStr: string) {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
}

function formatTime(timeStr: string) {
    if (!timeStr) return "";
    try {
        return new Date(timeStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return timeStr; }
}

export default function BookingsScreen() {
    const [statusFilter, setStatusFilter] = useState("All");

    // Fetch artist bookings from API
    const { data: bookingsResp, loading: bookingsLoading, error: bookingsError, reload } =
        useResource<{ data: ApiBooking[] }>("/bookings/artist_bookings");

    // Fetch dashboard stats from API (for summary cards)
    const { data: dashboardResp, loading: statsLoading } =
        useResource<{ stats: DashboardStats }>("/dashboard/artist");

    const stats = dashboardResp?.stats;

    // Normalise API bookings → display shape; fall back to mock if API is empty
    const bookings = useMemo(() => {
        const raw = bookingsResp?.data;
        if (raw && raw.length > 0) {
            return raw.map(b => ({
                id: b.id,
                customerName: b.customer_name,
                serviceName: b.service_name,
                bookingDate: formatDate(b.booking_date),
                startTime: formatTime(b.start_time),
                endTime: formatTime(b.end_time),
                status: b.status.toLowerCase(),
                totalAmount: Number(b.total_amount),
                createdAt: formatDate(b.created_at),
                avatarInitials: b.customer_name?.split(" ").map(n => n[0]).join("") || "?",
            }));
        }
        return MOCK_BOOKINGS; // Show mock while loading or if DB is empty
    }, [bookingsResp]);

    const summaryStats = [
        { label: "Upcoming", icon: "calendar-outline" as const, color: "#3b82f6", count: stats?.upcoming_bookings_count ?? MOCK_SUMMARY.upcoming_bookings_count },
        { label: "Pending", icon: "time-outline" as const, color: "#f59e0b", count: stats?.pending_bookings ?? MOCK_SUMMARY.pending_bookings },
        { label: "Done", icon: "checkmark-done-outline" as const, color: "#22c55e", count: stats?.completed_bookings ?? MOCK_SUMMARY.completed_bookings },
    ];

    const filtered = useMemo(() =>
        bookings.filter(b =>
            statusFilter === "All" || b.status === statusFilter.toLowerCase()
        ),
        [bookings, statusFilter]
    );

    return (
        <ScrollView className="flex-1 bg-dark-900" showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" backgroundColor="#0b1120" />

            {/* Header */}
            <View className="px-5 pt-14 pb-2">
                <View className="flex-row justify-between items-start">
                    <View>
                        <Text className="text-white text-2xl font-extrabold">Bookings</Text>
                        <Text className="text-slate-500 text-xs mt-1">
                            {bookings.length} total appointments
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-x-2">
                        {/* Live sync indicator */}
                        {bookingsLoading && <ActivityIndicator size="small" color="#4a7cf5" />}
                        {bookingsError && !bookingsLoading && (
                            <TouchableOpacity onPress={reload}>
                                <Ionicons name="refresh-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-accent items-center justify-center"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Summary Stats */}
            <View className="flex-row mx-5 mt-4 mb-4 gap-x-3">
                {summaryStats.map((stat) => (
                    <View
                        key={stat.label}
                        className="flex-1 bg-dark-700 rounded-2xl py-4 items-center border border-white/5"
                    >
                        <Ionicons name={stat.icon} size={22} color={stat.color} />
                        <Text className="text-white text-2xl font-extrabold mt-2">{stat.count}</Text>
                        <Text className="text-slate-500 text-[10px] font-medium mt-1">{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Filter Chips */}
            <View className="mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-5"
                    contentContainerStyle={{ gap: 8 }}
                >
                    {STATUS_FILTERS.map((filter) => {
                        const isActive = statusFilter === filter;
                        const statusConfig = STATUS_COLORS[filter.toLowerCase()];
                        return (
                            <TouchableOpacity
                                key={filter}
                                className={`px-4 py-2 rounded-full border flex-row items-center gap-x-1.5 ${isActive ? "bg-accent/15 border-accent" : "bg-dark-700 border-white/5"
                                    }`}
                                onPress={() => setStatusFilter(filter)}
                                activeOpacity={0.7}
                            >
                                {filter !== "All" && statusConfig && (
                                    <View className="w-2 h-2 rounded-full" style={{ backgroundColor: statusConfig.dot }} />
                                )}
                                {filter === "All" && isActive && (
                                    <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
                                )}
                                <Text className={`text-xs font-semibold ${isActive ? "text-accent" : "text-slate-400"}`}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Section Title */}
            <View className="px-5 flex-row justify-between items-center mb-3">
                <Text className="text-white text-base font-bold">
                    {statusFilter === "All" ? "All Bookings" : `${statusFilter} Bookings`}
                </Text>
                <Text className="text-slate-500 text-xs">{filtered.length} results</Text>
            </View>

            {/* Booking Cards */}
            <View className="px-5">
                {filtered.length === 0 ? (
                    <View className="items-center justify-center py-16 gap-y-3">
                        <Ionicons name="calendar-outline" size={48} color="#334155" />
                        <Text className="text-slate-500 text-base">No bookings found</Text>
                        <Text className="text-slate-600 text-xs">Try adjusting your filters</Text>
                    </View>
                ) : (
                    filtered.map((booking) => {
                        const config = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;
                        return (
                            <TouchableOpacity
                                key={booking.id}
                                className="bg-dark-700 rounded-2xl p-4 mb-3 border border-white/5"
                                style={{ borderLeftWidth: 3, borderLeftColor: config.dot }}
                                activeOpacity={0.7}
                            >
                                {/* Header Row */}
                                <View className="flex-row items-center mb-3">
                                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-dark-600">
                                        <Text className="text-white text-xs font-bold">
                                            {booking.avatarInitials}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white text-sm font-bold">{booking.customerName}</Text>
                                        <Text className="text-slate-400 text-xs mt-0.5">{booking.serviceName}</Text>
                                    </View>
                                    <View
                                        className="flex-row items-center gap-x-1.5 px-2.5 py-1 rounded-full"
                                        style={{ backgroundColor: config.bg }}
                                    >
                                        <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
                                        <Text className="text-[10px] font-semibold uppercase" style={{ color: config.text }}>
                                            {booking.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Date & Time Row */}
                                <View className="flex-row items-center gap-x-4 mb-3">
                                    <View className="flex-row items-center gap-x-1.5">
                                        <Ionicons name="calendar-outline" size={13} color="#64748b" />
                                        <Text className="text-slate-300 text-xs">{booking.bookingDate}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-x-1.5">
                                        <Ionicons name="time-outline" size={13} color="#64748b" />
                                        <Text className="text-slate-300 text-xs">
                                            {booking.startTime} – {booking.endTime}
                                        </Text>
                                    </View>
                                </View>

                                {/* Amount footer */}
                                <View className="flex-row justify-between items-center pt-2 border-t border-white/5">
                                    <Text className="text-slate-500 text-[10px]">Booked on {booking.createdAt}</Text>
                                    <Text className="text-accent text-base font-extrabold">
                                        ₹{booking.totalAmount.toLocaleString()}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            {/* Bottom spacer */}
            <View className="h-24" />
        </ScrollView>
    );
}
