"use client";
import { useEffect, useState } from "react";
import { Wallet, Activity, ArrowUpRight } from "@/components/dashboard/icons";
import { api } from "@/lib/api";
import { LoadingRows, ErrorMessage } from "@/components/dashboard/ui";

const money = (val: number, cur: string) => new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format(val);

export default function OverviewPage() {
  const [data, setData] = useState<{ available_balance: number; pending_balance: number; currency: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      // Re-using the wallet endpoint for dashboard overview metric cards
      const response = await api.get("/wallet");
      setData(response.data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingRows rows={3} columns={2} />;
  if (error || !data) return <ErrorMessage message={error} retry={load} />;

  return (
    <div className="reference-grid">
      <div className="overview-left">
        <article className="owed-card">
          <div className="owed-card-top">
            <span className="owed-mark"><Wallet className="h-5 w-5" /></span>
            <div>
              <p>Available Balance</p>
              <strong>{money(data.available_balance, data.currency)}</strong>
              <span>Ready for withdrawal</span>
            </div>
          </div>
          <div className="owed-split">
            <div><span>Pending Settlement</span><strong>{money(data.pending_balance, data.currency)}</strong></div>
            <div><span>Currency</span><strong>{data.currency}</strong></div>
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-card-heading">
            <h3>Recent System Activity</h3>
            <span>Live</span>
          </div>
          <div className="summary-row">
            <span className="summary-icon summary-icon-0"><Activity className="h-4 w-4" /></span>
            <span>Gateway connection</span>
            <strong className="text-green">Stable</strong>
          </div>
        </article>
      </div>

      <div className="activity-panel">
        <div className="activity-card min-h-[300px]">
          <div className="activity-heading">
            <h2>Fast Actions</h2>
            <span>Shortcuts</span>
          </div>
          <div className="p-6 grid gap-4">
            <a href="/payment-links" className="action-tile action-tile-mint">
              <span><ArrowUpRight className="h-4 w-4" /></span>
              <div>
                <strong>Create Payment Link</strong>
                <small>Accept money instantly without code</small>
              </div>
            </a>
            <a href="/withdrawals" className="action-tile action-tile-amber">
              <span><Wallet className="h-4 w-4" /></span>
              <div>
                <strong>Request Withdrawal</strong>
                <small>Move funds to your bank account</small>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}