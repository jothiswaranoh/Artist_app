import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { createBooking } from "../../services/bookings";

export default function BookingScreen() {
  const params = useLocalSearchParams();

  const artistId = Array.isArray(params.artistId)
    ? params.artistId[0]
    : params.artistId;

  const serviceId = Array.isArray(params.serviceId)
    ? params.serviceId[0]
    : params.serviceId;

  const serviceName = Array.isArray(params.serviceName)
    ? params.serviceName[0]
    : params.serviceName;

  const price = Array.isArray(params.price) ? params.price[0] : params.price;

  const duration = Array.isArray(params.duration)
    ? params.duration[0]
    : params.duration;

  const artistName = Array.isArray(params.artistName)
    ? params.artistName[0]
    : params.artistName;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dates = useMemo(() => {
    const result = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      result.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate().toString(),
        fullDate: date.toISOString().split("T")[0],
      });
    }

    return result;
  }, []);

  const times = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
  ];

  const isPastTime = (time: string) => {
    if (!selectedDate) return false;

    const today = new Date().toISOString().split("T")[0];

    if (selectedDate !== today) return false;

    const [hours, minutes] = time.split(":").map(Number);

    const now = new Date();
    const slotTime = new Date();

    slotTime.setHours(hours);
    slotTime.setMinutes(minutes);
    slotTime.setSeconds(0);
    slotTime.setMilliseconds(0);

    return slotTime < now;
  };

  const formatDateLabel = (date: string | null) => {
    if (!date) return "Not selected";

    const parsed = new Date(date);

    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const calculateEndTime = (startTime: string, durationInMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + durationInMinutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const endHours = String(date.getHours()).padStart(2, "0");
    const endMinutes = String(date.getMinutes()).padStart(2, "0");

    return `${endHours}:${endMinutes}`;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !serviceId || !artistId) {
      Alert.alert("Missing details", "Please select date and time.");
      return;
    }

    const parsedPrice = Number(price || 0);
    const parsedDuration = Number(duration || 60);
    const endTime = calculateEndTime(selectedTime, parsedDuration);

    try {
      setSubmitting(true);

      await createBooking({
        artistProfileId: artistId as string,
        serviceId: serviceId as string,
        bookingDate: selectedDate,
        startTime: selectedTime,
        endTime,
        totalAmount: parsedPrice,
        status: "pending",
      });

      router.replace({
        pathname: "/booking/success",
        params: {
          serviceName: serviceName || "Your service",
          artistName: artistName || "Selected artist",
          selectedDate,
          selectedTime,
          price: String(parsedPrice),
        },
      });
    } catch (error: any) {
      console.error("Booking failed", error);
      Alert.alert(
        "Booking failed",
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-900">
      <Stack.Screen
        options={{
          title: "Book Appointment",
          headerBackTitle: "Back",
        }}
      />

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-dark-700 rounded-2xl p-5 mb-8 border border-white/5">
          <Text className="text-white text-lg font-semibold mb-4">
            Booking Summary
          </Text>

          <View className="gap-3">
            <View className="flex-row items-start justify-between">
              <Text className="text-slate-400 text-sm">Service</Text>
              <Text className="text-white text-sm font-medium max-w-[65%] text-right">
                {serviceName || "Not available"}
              </Text>
            </View>

            <View className="flex-row items-start justify-between">
              <Text className="text-slate-400 text-sm">Price</Text>
              <Text className="text-white text-sm font-medium">
                {price ? `₹${price}` : "Not available"}
              </Text>
            </View>

            {duration ? (
              <View className="flex-row items-start justify-between">
                <Text className="text-slate-400 text-sm">Duration</Text>
                <Text className="text-white text-sm font-medium">
                  {duration} mins
                </Text>
              </View>
            ) : null}

            <View className="flex-row items-start justify-between">
              <Text className="text-slate-400 text-sm">Artist</Text>
              <Text className="text-white text-sm font-medium max-w-[65%] text-right">
                {artistName || artistId || "Not available"}
              </Text>
            </View>

            <View className="h-px bg-white/5 my-1" />

            <View className="flex-row items-start justify-between">
              <Text className="text-slate-400 text-sm">Date</Text>
              <Text className="text-white text-sm font-medium">
                {formatDateLabel(selectedDate)}
              </Text>
            </View>

            <View className="flex-row items-start justify-between">
              <Text className="text-slate-400 text-sm">Time</Text>
              <Text className="text-white text-sm font-medium">
                {selectedTime || "Not selected"}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-slate-400 text-sm mb-3">Select date</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        >
          <View className="flex-row gap-3 pr-6">
            {dates.map((d) => (
              <TouchableOpacity
                key={d.fullDate}
                onPress={() => setSelectedDate(d.fullDate)}
                className={`w-20 py-4 rounded-2xl items-center border ${
                  selectedDate === d.fullDate
                    ? "bg-purple-600 border-purple-500"
                    : "bg-dark-700 border-white/5"
                }`}
              >
                <Text
                  className={`text-xs mb-1 ${
                    selectedDate === d.fullDate
                      ? "text-white/80"
                      : "text-slate-400"
                  }`}
                >
                  {d.day}
                </Text>

                <Text className="text-white font-semibold text-lg">
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text className="text-slate-400 text-sm mb-3">Select time</Text>

        <View className="flex-row flex-wrap gap-3 mb-10">
          {times.map((time) => {
            const disabled = isPastTime(time);

            return (
              <TouchableOpacity
                key={time}
                disabled={disabled || submitting}
                onPress={() => setSelectedTime(time)}
                className={`min-w-[88px] px-5 py-3 rounded-2xl items-center border ${
                  disabled
                    ? "bg-slate-800 border-slate-800"
                    : selectedTime === time
                    ? "bg-purple-600 border-purple-500"
                    : "bg-dark-700 border-white/5"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    disabled ? "text-slate-600" : "text-white"
                  }`}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View className="p-6 border-t border-white/5 bg-dark-900">
        <TouchableOpacity
          disabled={!selectedDate || !selectedTime || submitting}
          onPress={handleBooking}
          className={`rounded-2xl p-4 items-center ${
            selectedDate && selectedTime && !submitting
              ? "bg-purple-600"
              : "bg-slate-700"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}