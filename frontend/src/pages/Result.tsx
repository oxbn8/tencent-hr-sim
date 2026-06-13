import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";

/** 评分已合并至挑战页；此路由保留兼容旧链接 */
export default function Result() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const nav = useNavigate();

  useEffect(() => {
    nav("/game", { replace: true });
  }, [nav, submissionId]);

  return <Layout title="跳转中…">正在返回控制台…</Layout>;
}
