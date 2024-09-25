"use client";

import React from "react";
import { api } from "@/trpc/react";
import CoinsGrid from "./components/coins-grid";

export default function TokensList() {
  const { data: tokens, isLoading, } = api.token.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    tokens ? <CoinsGrid tokens={tokens} /> : <div>No tokens found</div>
  );
}

