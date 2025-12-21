import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import UserPageLayout from "../../layout/UserPageLayout";
import {
  downloadOrderInvoice,
  getOrderById,
  type Order,
} from "../../services/orders.api";

type LocationState = {
  order?: Order;
} | null;

export default function OrderConfirmationPageBuyer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const initialOrder = (location.state as LocationState)?.order ?? null;

  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [loading, setLoading] = useState<boolean>(!initialOrder);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!order && id) {
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
    }
  }, [id, order]);

  async function handleDownloadInvoice() {
    if (!order) return;
    try {
      await downloadOrderInvoice(order.id);
    } catch (err) {
      console.error("Erreur téléchargement facture :", err);
    }
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
          <Button variant="contained" onClick={() => navigate("/home")}>
            Retour à l&apos;accueil
          </Button>
        </Container>
      </UserPageLayout>
    );
  }

  const createdAt = new Date(order.createdAt).toLocaleString("fr-FR");

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "900px", py: 4 }}>
        <Card sx={{ p: 4, borderRadius: 3 }}>
          <Typography fontSize={26} fontWeight={900} mb={1}>
            Merci pour votre commande !
          </Typography>
          <Typography color="gray" mb={3}>
            Votre paiement a bien été confirmé. Un récapitulatif de commande est
            disponible ci-dessous.
          </Typography>

          <Typography fontWeight={700} mb={1}>
            Numéro de commande : {order.id}
          </Typography>
          <Typography color="gray" mb={2}>
            Date : {createdAt}
          </Typography>

          <Divider sx={{ my: 2 }} />

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

          <Divider sx={{ my: 2 }} />

          <Typography fontWeight={800} mb={1}>
            Récapitulatif des articles
          </Typography>

          {order.items.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Box>
                <Typography fontWeight={700}>{item.articleTitle}</Typography>
                <Typography color="gray" fontSize={13}>
                  Vendu par {item.shopName}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography fontSize={14}>
                  {item.quantity} × {item.unitPrice.toFixed(2)} €
                </Typography>
                <Typography fontSize={14} fontWeight={700}>
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
            <Typography fontWeight={800}>Total payé</Typography>
            <Typography fontWeight={900} fontSize={20}>
              {order.totalAmount.toFixed(2)} {order.currency}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={handleDownloadInvoice}>
              Télécharger le récapitulatif (PDF)
            </Button>

            <Button variant="text" onClick={() => navigate("/home")}>
              Retour à l&apos;accueil
            </Button>
          </Box>
        </Card>
      </Container>
    </UserPageLayout>
  );
}
