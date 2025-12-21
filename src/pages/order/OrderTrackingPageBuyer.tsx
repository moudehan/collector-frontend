import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserPageLayout from "../../layout/UserPageLayout";
import {
  downloadOrderInvoice,
  getOrderById,
  type Order,
} from "../../services/orders.api";

const STEPS = [
  "Commande passée",
  "Paiement confirmé",
  "En préparation",
  "Expédiée",
  "Livrée",
];

function resolveStepIndex(status: string): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "PAID":
      return 1;
    case "PROCESSING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    case "CANCELED":
      return 1;
    default:
      return 0;
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

function getStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "En attente de paiement";
    case "PAID":
      return "Paiement confirmé";
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

export default function OrderTrackingPageBuyer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Commande introuvable.");
      setLoading(false);
      return;
    }

    let canceled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (!canceled) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        console.error("Erreur chargement commande :", err);
        if (!canceled) {
          setError("Impossible de charger votre commande.");
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
  }, [id]);

  async function handleDownloadInvoice() {
    if (!order) return;
    try {
      await downloadOrderInvoice(order.id);
    } catch (err) {
      console.error("Erreur téléchargement facture :", err);
    }
  }

  function handleContactSeller() {
    if (!order || order.items.length === 0) return;
    const firstItem = order.items[0];

    navigate("/conversations", {
      state: {
        articleId: firstItem.articleId,
        shopId: firstItem.shopId,
        sellerId: firstItem.sellerId,
      },
    });
  }

  if (loading) {
    return (
      <UserPageLayout>
        <Container sx={{ maxWidth: "900px", py: 4 }}>
          <Typography>Chargement de la commande...</Typography>
        </Container>
      </UserPageLayout>
    );
  }

  if (error || !order) {
    return (
      <UserPageLayout>
        <Container sx={{ maxWidth: "900px", py: 4 }}>
          <Typography color="error" mb={2}>
            {error ?? "Commande introuvable."}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/purchases")}>
            Retour à mes achats
          </Button>
        </Container>
      </UserPageLayout>
    );
  }

  const stepIndex = resolveStepIndex(order.status);
  const statusChipColor = getStatusChipColor(order.status);
  const statusLabel = getStatusLabel(order.status);
  const createdAt = new Date(order.createdAt).toLocaleString("fr-FR");

  const totalShipping = order.items.reduce(
    (acc, item) => acc + item.shippingCost,
    0
  );

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "900px", py: 4 }}>
        <Typography fontSize={26} fontWeight={900} mb={2}>
          Suivi de la commande
        </Typography>
        <Typography color="gray" mb={3}>
          Commande n° {order.id} — passée le {createdAt}
        </Typography>

        <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography fontSize={18} fontWeight={800} mb={1}>
                Statut de votre commande
              </Typography>
              <Chip label={statusLabel} color={statusChipColor} />
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={handleDownloadInvoice}>
                Télécharger le récapitulatif (PDF)
              </Button>
              <Button variant="contained" onClick={handleContactSeller}>
                Contacter le vendeur
              </Button>
            </Box>
          </Box>

          <Stepper activeStep={stepIndex} alternativeLabel>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  optional={
                    index === stepIndex ? (
                      <Typography variant="caption">Étape actuelle</Typography>
                    ) : undefined
                  }
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>

        <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography fontWeight={800} mb={1}>
            Détails de la commande
          </Typography>

          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Box>
                <Typography fontWeight={700}>{item.articleTitle}</Typography>
                <Typography fontSize={13} color="gray">
                  Vendu par {item.shopName}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography fontSize={14}>
                  {item.quantity} × {item.unitPrice.toFixed(2)} €
                </Typography>
                <Typography fontWeight={700} fontSize={14}>
                  {(item.quantity * item.unitPrice).toFixed(2)} €
                </Typography>
                <Typography fontSize={12} color="gray">
                  Livraison : {item.shippingCost.toFixed(2)} €
                </Typography>
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography color="gray">Frais de livraison total</Typography>
            <Typography fontWeight={700}>
              {totalShipping.toFixed(2)} €
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight={800}>Total payé</Typography>
            <Typography fontWeight={900} fontSize={18}>
              {order.totalAmount.toFixed(2)} {order.currency}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography fontWeight={800} mb={1}>
            Adresse de livraison
          </Typography>
          <Typography>
            {order.shippingFullName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 && (
              <>
                <br />
                {order.shippingLine2}
              </>
            )}
            <br />
            {order.shippingPostalCode} {order.shippingCity}
            <br />
            {order.shippingCountry}
            {order.shippingPhone && (
              <>
                <br />
                {order.shippingPhone}
              </>
            )}
          </Typography>
        </Card>
      </Container>
    </UserPageLayout>
  );
}
