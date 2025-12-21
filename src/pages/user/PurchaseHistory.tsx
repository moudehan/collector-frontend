import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import { useNavigate } from "react-router-dom";

import UserPageLayout from "../../layout/UserPageLayout";
import {
  downloadOrderInvoice,
  getMyOrders,
  type Order,
} from "../../services/orders.api";

type SortBy = "recent" | "old" | "priceUp" | "priceDown";
type StatusFilter = "all" | "paid" | "pending" | "canceled";

export default function PurchaseHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState<number>(1);

  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getMyOrders();
        if (!canceled) {
          setOrders(data);
          setError(null);
        }
      } catch (err) {
        console.error("Erreur chargement commandes :", err);
        if (!canceled) {
          setError("Impossible de charger vos achats pour le moment.");
        }
      } finally {
        if (!canceled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  function getStatusLabel(status: string): string {
    switch (status) {
      case "PAID":
        return "Payée";
      case "PENDING":
        return "En cours";
      case "CANCELED":
        return "Annulée";
      default:
        return status;
    }
  }

  function getStatusColor(
    status: string
  ): "success" | "warning" | "error" | "default" {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "CANCELED":
        return "error";
      default:
        return "default";
    }
  }

  const processedOrders = useMemo(() => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => {
        if (statusFilter === "paid") return o.status === "PAID";
        if (statusFilter === "pending") return o.status === "PENDING";
        if (statusFilter === "canceled") return o.status === "CANCELED";
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      if (sortBy === "old") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      if (sortBy === "priceUp") {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === "priceDown") {
        return b.totalAmount - a.totalAmount;
      }
      return 0;
    });

    return sorted;
  }, [orders, sortBy, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(processedOrders.length / pageSize));

  const pagedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return processedOrders.slice(start, end);
  }, [processedOrders, page]);

  function formatOrderDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleViewArticle(order: Order) {
    const firstItem = order.items[0];
    if (!firstItem) return;
    navigate(`/articles/${firstItem.articleId}`);
  }

  async function handleDownloadInvoice(order: Order) {
    try {
      await downloadOrderInvoice(order.id);
    } catch (err) {
      console.error("Erreur téléchargement facture :", err);
    }
  }

  function handleContactSeller(order: Order) {
    const firstItem = order.items[0];
    if (!firstItem) return;

    navigate("/conversation", {
      state: {
        articleId: firstItem.articleId,
        shopId: firstItem.shopId,
        sellerId: firstItem.sellerId,
      },
    });
  }

  function handleTrackOrder(order: Order) {
    navigate(`/orders/${order.id}`);
  }

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Typography fontSize={28} fontWeight={900} mb={3}>
          Historique d’achats
        </Typography>

        <Card
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            boxShadow: "0 3px 18px rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="recent">Plus récent</MenuItem>
            <MenuItem value="old">Plus ancien</MenuItem>
            <MenuItem value="priceUp">Prix croissant</MenuItem>
            <MenuItem value="priceDown">Prix décroissant</MenuItem>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="paid">Payée</MenuItem>
            <MenuItem value="pending">En cours</MenuItem>
            <MenuItem value="canceled">Annulée</MenuItem>
          </Select>
        </Card>

        {loading && (
          <Typography color="gray" mb={2}>
            Chargement de vos achats...
          </Typography>
        )}

        {error && !loading && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {!loading && !error && processedOrders.length === 0 && (
          <Typography color="gray">
            Vous n&apos;avez pas encore passé de commande.
          </Typography>
        )}

        {pagedOrders.map((order) => {
          const firstItem = order.items[0];
          const title =
            firstItem?.articleTitle ??
            `${order.items.length} article${order.items.length > 1 ? "s" : ""}`;

          const price = order.totalAmount;
          const date = formatOrderDate(order.createdAt);
          const statusLabel = getStatusLabel(order.status);
          const statusColor = getStatusColor(order.status);

          const initials =
            firstItem?.articleTitle?.slice(0, 2).toUpperCase() ?? "CM";

          return (
            <Card
              key={order.id}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 90,
                    height: 90,
                    borderRadius: 2,
                    bgcolor: "#f0f0ff",
                    fontWeight: 800,
                    fontSize: 22,
                  }}
                >
                  {initials}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography fontSize={18} fontWeight={800}>
                    {title}
                  </Typography>
                  <Typography color="gray" fontSize={14}>
                    {price.toFixed(2)} € — commandé le {date}
                  </Typography>

                  <Chip
                    label={statusLabel}
                    color={statusColor}
                    sx={{ mt: 1, fontWeight: 700 }}
                  />
                </Box>

                {firstItem && (
                  <Button
                    onClick={() => handleViewArticle(order)}
                    endIcon={<ArrowForwardIosIcon />}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Voir l’article
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<ReceiptLongIcon />}
                  onClick={() => handleDownloadInvoice(order)}
                >
                  Télécharger facture
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<SupportAgentIcon />}
                  onClick={() => handleContactSeller(order)}
                >
                  Contacter vendeur
                </Button>

                <Button variant="text" onClick={() => handleTrackOrder(order)}>
                  Suivre ma commande
                </Button>
              </Box>
            </Card>
          );
        })}

        {!loading && processedOrders.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pageCount}
              color="primary"
              size="large"
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        )}
      </Box>
    </UserPageLayout>
  );
}
