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
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { useNavigate } from "react-router-dom";

import UserPageLayout from "../../layout/UserPageLayout";
import {
  getMySales,
  updateOrderStatus,
  type OrderStatus,
  type SaleItem,
} from "../../services/orders.api";

type SortBy = "recent" | "old" | "priceUp" | "priceDown";
type StatusFilter =
  | "all"
  | "paid"
  | "pending"
  | "shipped"
  | "delivered"
  | "canceled";

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "PAID":
      return "Paiement reçu";
    case "PROCESSING":
      return "En préparation";
    case "SHIPPED":
      return "Expédiée";
    case "DELIVERED":
      return "Livrée";
    case "CANCELED":
      return "Annulée";
    default:
      return status;
  }
}

function getStatusChipColor(
  status: string
): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "success";
    case "PENDING":
    case "PROCESSING":
    case "SHIPPED":
      return "warning";
    case "CANCELED":
      return "error";
    default:
      return "default";
  }
}

function mapFilterToStatuses(filter: StatusFilter): OrderStatus[] | null {
  if (filter === "all") return null;
  if (filter === "paid") return ["PAID"];
  if (filter === "pending") return ["PENDING", "PROCESSING"];
  if (filter === "shipped") return ["SHIPPED"];
  if (filter === "delivered") return ["DELIVERED"];
  if (filter === "canceled") return ["CANCELED"];
  return null;
}

export default function SalesHistory() {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState<number>(1);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getMySales();
        if (!canceled) {
          setSales(data);
          setError(null);
        }
      } catch (err) {
        console.error("Erreur chargement ventes :", err);
        if (!canceled) {
          setError("Impossible de charger vos ventes pour le moment.");
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

  const processedSales = useMemo(() => {
    let filtered = sales;

    const allowed = mapFilterToStatuses(statusFilter);
    if (allowed) {
      filtered = filtered.filter((s) =>
        allowed.includes(s.order.status as OrderStatus)
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.order.createdAt).getTime();
      const dateB = new Date(b.order.createdAt).getTime();

      if (sortBy === "recent") {
        return dateB - dateA;
      }
      if (sortBy === "old") {
        return dateA - dateB;
      }
      if (sortBy === "priceUp") {
        const priceA = a.unitPrice * a.quantity;
        const priceB = b.unitPrice * b.quantity;
        return priceA - priceB;
      }
      if (sortBy === "priceDown") {
        const priceA = a.unitPrice * a.quantity;
        const priceB = b.unitPrice * b.quantity;
        return priceB - priceA;
      }
      return 0;
    });

    return sorted;
  }, [sales, sortBy, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(processedSales.length / pageSize));

  const pagedSales = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return processedSales.slice(start, end);
  }, [processedSales, page]);

  function formatOrderDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handleViewArticle(sale: SaleItem) {
    navigate(`/articles/${sale.articleId}`);
  }

  function handleContactBuyer(sale: SaleItem) {
    navigate("/conversation", {
      state: {
        articleId: sale.articleId,
        shopId: sale.shopId,
        sellerId: sale.sellerId,
      },
    });
  }

  async function handleChangeStatus(sale: SaleItem, newStatus: OrderStatus) {
    try {
      setUpdatingStatusId(sale.order.id);
      const updatedOrder = await updateOrderStatus(sale.order.id, newStatus);

      setSales((prev) =>
        prev.map((item) =>
          item.order.id === sale.order.id
            ? { ...item, order: { ...item.order, status: updatedOrder.status } }
            : item
        )
      );

      setStatusFilter("all");
      setPage(1);
    } catch (err) {
      console.error("Erreur mise à jour status :", err);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <UserPageLayout>
      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Typography fontSize={28} fontWeight={900} mb={1}>
          Historique de ventes
        </Typography>

        <Typography fontSize={14} color="gray" mb={3}>
          {loading
            ? "Chargement..."
            : `Nombre de lignes de ventes récupérées : ${sales.length}`}
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
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Tous les statuts</MenuItem>
            <MenuItem value="paid">Paiement reçu</MenuItem>
            <MenuItem value="pending">En attente / préparation</MenuItem>
            <MenuItem value="shipped">Expédiée</MenuItem>
            <MenuItem value="delivered">Livrée</MenuItem>
            <MenuItem value="canceled">Annulée</MenuItem>
          </Select>
        </Card>

        {loading && (
          <Typography color="gray" mb={2}>
            Chargement de vos ventes...
          </Typography>
        )}

        {error && !loading && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {!loading && !error && processedSales.length === 0 && (
          <Typography color="gray">
            Vous n&apos;avez pas encore réalisé de vente.
          </Typography>
        )}

        {/* Liste des ventes */}
        {pagedSales.map((s) => {
          const title = s.articleTitle;
          const price = s.unitPrice * s.quantity;
          const date = formatOrderDate(s.order.createdAt);
          const statusLabel = getStatusLabel(s.order.status);
          const statusColor = getStatusChipColor(s.order.status);
          const initials = title.slice(0, 2).toUpperCase();

          const buyerLabel =
            s.buyerName ?? s.order.shippingFullName ?? "Client Collector";

          return (
            <Card
              key={s.id}
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
                    {price.toFixed(2)} € — vendu le {date}
                  </Typography>

                  <Typography fontSize={14} sx={{ mt: 0.5 }}>
                    Acheteur : <b>{buyerLabel}</b>
                  </Typography>

                  <Chip
                    label={statusLabel}
                    color={statusColor}
                    sx={{ mt: 1, fontWeight: 700 }}
                  />
                </Box>

                <Button
                  onClick={() => handleViewArticle(s)}
                  endIcon={<ArrowForwardIosIcon />}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Voir l’article
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  startIcon={<SupportAgentIcon />}
                  onClick={() => handleContactBuyer(s)}
                >
                  Contacter l’acheteur
                </Button>

                <Select
                  size="small"
                  value={s.order.status}
                  onChange={(e) =>
                    handleChangeStatus(s, e.target.value as OrderStatus)
                  }
                  disabled={updatingStatusId === s.order.id}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="PENDING">En attente</MenuItem>
                  <MenuItem value="PAID">Paiement reçu</MenuItem>
                  <MenuItem value="PROCESSING">En préparation</MenuItem>
                  <MenuItem value="SHIPPED">Expédiée</MenuItem>
                  <MenuItem value="DELIVERED">Livrée</MenuItem>
                  <MenuItem value="CANCELED">Annulée</MenuItem>
                </Select>
              </Box>
            </Card>
          );
        })}

        {!loading && processedSales.length > 0 && (
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
