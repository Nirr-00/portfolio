"use client";

import { use } from "react";
import PostDetail from "@/components/post/PostDetail";

export default function RecruitDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <PostDetail id={id} postType="recruits" />;
}