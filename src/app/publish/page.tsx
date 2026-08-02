"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function PublishChooserPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) {
          router.push("/login");
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  if (!checked) {
    return (
      <div className="citadel-container py-16 text-center text-ink-muted text-sm">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="citadel-container py-6 max-w-lg mx-auto space-y-4">
      <h1 className="font-display text-xl font-bold text-gold-400">Что хотите разместить?</h1>

      <Link href="/market/create">
        <Card variant="interactive" padding="lg" className="flex items-center gap-4">
          <IconMarket />
          <div>
            <p className="text-sm font-semibold text-ink">Объявление в маркете</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Продажа товара, услуги или цифрового продукта с ценой
            </p>
          </div>
        </Card>
      </Link>

      <Link href="/forum">
        <Card variant="interactive" padding="lg" className="flex items-center gap-4">
          <IconForum />
          <div>
            <p className="text-sm font-semibold text-ink">Тема на форуме</p>
            <p className="text-xs text-ink-muted mt-0.5">
              Обсуждение, вопрос или публикация без привязки к цене
            </p>
          </div>
        </Card>
      </Link>
    </div>
  );
}

function IconMarket() {
  return (
    <span className="flex items-center justify-center h-11 w-11 rounded-full bg-gold-400/15 text-gold-400 shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 8L5.5 4H18.5L20 8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 8H20V19C20 19.55 19.55 20 19 20H5C4.45 20 4 19.55 4 19V8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9 12C9 13.1 9.9 14 11 14H13C14.1 14 15 13.1 15 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function IconForum() {
  return (
    <span className="flex items-center justify-center h-11 w-11 rounded-full bg-gold-400/15 text-gold-400 shrink-0">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 5H20V16H9L5 19.5V16H4V5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}