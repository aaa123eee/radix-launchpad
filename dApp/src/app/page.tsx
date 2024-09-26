"use client";

import React from "react";
import { api } from "@/trpc/react";
import CoinsGrid from "./components/coins-grid";

export default function TokensList() {
  const { data: tokens, isLoading } = api.token.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-yellow-500"></div>
      </div>
    );
  }

  return <CoinsGrid tokens={tokens} />;
}
