"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "./LiffProvider";

export default function ExpenseForm() {
  const router = useRouter();
  const { activeTrip, members, currentUser } = useLiff();

  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [paymentType, setPaymentType] = useState<"card" | "cash">("card");
  const [payerId, setPayerId] = useState(currentUser?.user_id ?? "");
  const [beneficiaryIds, setBeneficiaryIds] = useState<string[]>(
    members.map((m) => m.user_id)
  );
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split("T")[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBeneficiary = (uid: string) => {
    setBeneficiaryIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!activeTrip) return;
    if (!amount || Number(amount) <= 0) { setError("金額を入力してください"); return; }
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    if (!payerId) { setError("支払者を選択してください"); return; }
    if (beneficiaryIds.length === 0) { setError("受益者を1人以上選択してください"); return; }

    setUploading(true);
    setError(null);

    let imageUrl: string | null = null;

    // 画像アップロード
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (uploadRes.ok) {
        const { url } = await uploadRes.json();
        imageUrl = url;
      }
    }

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trip_id: activeTrip.trip_id,
        payer_id: payerId,
        amount: Number(amount),
        payment_type: paymentType,
        title: title.trim(),
        memo: memo.trim() || null,
        image_url: imageUrl,
        paid_at: paidAt,
        beneficiary_ids: beneficiaryIds,
      }),
    });

    setUploading(false);

    if (!res.ok) {
      const { error: e } = await res.json();
      setError(e);
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-brand-green text-white px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-white">←</button>
        <h1 className="text-lg font-bold">支出を記録する</h1>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
        )}

        {/* 金額 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="text-xs text-gray-500">金額（円）</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-3xl font-bold border-b-2 border-brand-green outline-none py-1 mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：レンタカー、居酒屋代"
              className="w-full border rounded-xl px-3 py-2 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">支払日</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm mt-1"
            />
          </div>
        </div>

        {/* メモ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-xs text-gray-500">詳細メモ（任意・150文字以内）</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={150}
            placeholder="「那覇空港で借りた白いシエンタ」など..."
            rows={3}
            className="w-full border rounded-xl px-3 py-2 text-sm mt-1 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{memo.length}/150</p>
        </div>

        {/* 支払方法 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <div>
            <label className="text-xs text-gray-500">支払方法</label>
            <div className="flex gap-2 mt-2">
              {(["card", "cash"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setPaymentType(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                    paymentType === t
                      ? "border-brand-green bg-green-50 text-brand-green"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {t === "card" ? "💳 共通カード" : "💴 現金立替"}
                </button>
              ))}
            </div>
          </div>

          {/* 支払者 */}
          <div>
            <label className="text-xs text-gray-500">支払者</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.user_id}
                  onClick={() => setPayerId(m.user_id)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                    payerId === m.user_id
                      ? "border-brand-green bg-green-50 text-brand-green font-bold"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>

          {/* 受益者 */}
          <div>
            <label className="text-xs text-gray-500">受益者（割り勘対象）</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.user_id}
                  onClick={() => toggleBeneficiary(m.user_id)}
                  className={`px-3 py-1.5 rounded-full text-sm border-2 transition-colors ${
                    beneficiaryIds.includes(m.user_id)
                      ? "border-brand-green bg-green-50 text-brand-green font-bold"
                      : "border-gray-200 text-gray-400"
                  }`}
                >
                  {beneficiaryIds.includes(m.user_id) ? "✓ " : ""}
                  {m.display_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 写真・レシート */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="text-xs text-gray-500">📷 写真・レシート（任意）</label>
          {imagePreview ? (
            <div className="relative mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="プレビュー" className="w-full rounded-xl object-cover max-h-48" />
              <button
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-gray-600"
              >
                ×
              </button>
            </div>
          ) : (
            <label className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 cursor-pointer hover:border-brand-green">
              <span className="text-2xl">📷</span>
              <span className="text-sm text-gray-400 mt-1">タップして追加</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* 固定フッター */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <button
          onClick={submit}
          disabled={uploading}
          className="w-full bg-brand-green text-white rounded-2xl py-4 text-lg font-bold shadow-lg disabled:opacity-50"
        >
          {uploading ? "保存中..." : "この支出を記録する"}
        </button>
      </div>
    </div>
  );
}
