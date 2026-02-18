"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import bs58 from "bs58";
import { authClient, useSession } from "@/lib/auth-client";

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}\u2025${address.slice(-4)}`;
}

export function SignInCard() {
  const router = useRouter();
  const { publicKey, signMessage, connected, connecting, disconnect, wallet } =
    useWallet();
  const { setVisible } = useWalletModal();
  const { data: session, refetch } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) return;

    setLoading(true);
    setError(null);

    try {
      const address = publicKey.toBase58();

      const { data: nonceData, error: nonceError } =
        await authClient.siws.getNonce({
          address,
          cluster: "devnet",
        });

      if (nonceError || !nonceData) {
        throw new Error(nonceError?.message || "Failed to get nonce");
      }

      const messageBytes = new TextEncoder().encode(nonceData.message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      const { error: verifyError } = await authClient.siws.verify({
        message: nonceData.message,
        signature,
        address,
        cluster: "devnet",
      });

      if (verifyError) {
        throw new Error(verifyError.message || "Verification failed");
      }

      await refetch();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    await refetch();
    router.refresh();
  };

  // Skeleton while client hydrates
  if (!mounted) {
    return (
      <section className="flex flex-col gap-3">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
      </section>
    );
  }

  // State: no wallet connected
  if (!connected) {
    return (
      <section className="flex flex-col gap-3">
        <button
          onClick={() => setVisible(true)}
          disabled={connecting}
          className="h-10 w-full rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {connecting ? "Connecting..." : "Connect wallet"}
        </button>

      </section>
    );
  }

  // State: connected but not signed in
  if (!session) {
    return (
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
          <span className="flex items-center gap-2">
            {wallet?.adapter.icon && (
              <img src={wallet.adapter.icon} alt="" className="h-4 w-4" />
            )}
            <span className="font-mono text-xs text-foreground">
              {publicKey && truncateAddress(publicKey.toBase58())}
            </span>
          </span>
          <button
            onClick={() => disconnect()}
            className="text-xs text-gray-500 transition-colors hover:text-foreground"
          >
            Disconnect
          </button>
        </div>
        <button
          onClick={handleSignIn}
          disabled={loading || !signMessage}
          className="h-10 w-full rounded-lg bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Waiting for signature..." : "Sign message to continue"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <p className="text-xs text-gray-500">
          Your wallet will prompt you to sign a message. This does not approve
          any transaction.
        </p>
      </section>
    );
  }

  // State: authenticated
  return (
    <section>
      <div className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
        <span className="flex items-center gap-2">
          {wallet?.adapter.icon && (
            <img src={wallet.adapter.icon} alt="" className="h-4 w-4" />
          )}
          <span className="font-mono text-xs text-foreground">
            {publicKey && truncateAddress(publicKey.toBase58())}
          </span>
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
            Authenticated
          </span>
        </span>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </section>
  );
}
