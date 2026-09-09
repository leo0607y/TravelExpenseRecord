"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 指定した旅行(trip)の支出・積立・旅行情報の変更をリアルタイムに検知し、
 * onChange を呼び出す。誰か1人が支出や積立を登録・承認すると、
 * 他のメンバーの画面も自動的に最新の精算状況に更新される。
 */
export function useTripRealtime(tripId: string | null | undefined, onChange: () => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!tripId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`trip-realtime-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses", filter: `trip_id=eq.${tripId}` },
        () => onChangeRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "savings", filter: `trip_id=eq.${tripId}` },
        () => onChangeRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trips", filter: `trip_id=eq.${tripId}` },
        () => onChangeRef.current()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);
}
