import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { stripePromise } from "../../../stripe";
import UserPageLayout from "../../layout/UserPageLayout";

import {
  createPaymentIntent,
  getMyShippingAddress,
  type ShippingAddressPayload,
} from "../../services/checkout.api";

import { useCart } from "../../contexte/cart/useCart";
import { confirmOrder } from "../../services/orders.api";
import type { CartItem } from "../../types/cart.type";

function CheckoutForm() {
  const { cart, cartItemsCount } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [address, setAddress] = useState<ShippingAddressPayload>({
    fullName: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "FR",
    phone: "",
  });

  const [loadingAddress, setLoadingAddress] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const saved = await getMyShippingAddress();
        if (!canceled && saved) {
          setAddress({
            fullName: saved.fullName,
            line1: saved.line1,
            line2: saved.line2 ?? "",
            postalCode: saved.postalCode,
            city: saved.city,
            country: saved.country,
            phone: saved.phone ?? "",
          });
        }
      } catch (err) {
        console.error("Erreur chargement adresse:", err);
      } finally {
        if (!canceled) setLoadingAddress(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const subtotal =
    cart?.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    ) ?? 0;

  const shipping =
    cart?.items.reduce((acc, item: CartItem) => {
      const raw = item.article.shipping_cost as
        | number
        | string
        | null
        | undefined;

      let cost: number;
      if (raw == null) {
        cost = 0;
      } else if (typeof raw === "number") {
        cost = raw;
      } else {
        const parsed = Number(raw);
        cost = Number.isFinite(parsed) ? parsed : 0;
      }

      return acc + cost;
    }, 0) ?? 0;

  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!stripe || !elements) {
      setErrorMessage("Stripe n'est pas prêt, veuillez réessayer.");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setErrorMessage("Votre panier est vide.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage("Veuillez saisir les informations de carte bancaire.");
      return;
    }

    setSubmitting(true);

    try {
      const { clientSecret } = await createPaymentIntent(address);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: address.fullName,
          },
        },
      });

      if (result.error) {
        setErrorMessage(result.error.message ?? "Erreur lors du paiement.");
        return;
      }

      if (result.paymentIntent?.status !== "succeeded") {
        setErrorMessage("Paiement non finalisé, veuillez réessayer.");
        return;
      }

      try {
        const order = await confirmOrder(result.paymentIntent.id);

        setSuccessMessage("Paiement réussi ! Merci pour votre commande.");

        navigate(`/orders/confirmation/${order.id}`, { state: { order } });
      } catch (err) {
        console.error("Erreur lors de la confirmation de commande:", err);
        const msg =
          err instanceof Error
            ? err.message
            : "Erreur inconnue lors de la confirmation de commande.";

        setErrorMessage(
          `Le paiement a été validé, mais l'enregistrement de la commande a échoué : ${msg}`
        );
      }
    } catch (err) {
      console.error("Erreur pendant le paiement (Stripe ou API):", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Erreur inconnue pendant le paiement.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingAddress && !cart) {
    return (
      <Typography fontSize={18} fontWeight={700}>
        Chargement du checkout...
      </Typography>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}
    >
      <Box sx={{ flex: 2 }}>
        <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography fontSize={20} fontWeight={800} mb={2}>
            Adresse de livraison
          </Typography>

          <TextField
            label="Nom complet"
            fullWidth
            required
            margin="dense"
            value={address.fullName}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, fullName: e.target.value }))
            }
          />
          <TextField
            label="Adresse"
            fullWidth
            required
            margin="dense"
            value={address.line1}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, line1: e.target.value }))
            }
          />
          <TextField
            label="Complément d'adresse"
            fullWidth
            margin="dense"
            value={address.line2}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, line2: e.target.value }))
            }
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Code postal"
              required
              margin="dense"
              value={address.postalCode}
              onChange={(e) =>
                setAddress((prev) => ({
                  ...prev,
                  postalCode: e.target.value,
                }))
              }
            />
            <TextField
              label="Ville"
              required
              margin="dense"
              fullWidth
              value={address.city}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, city: e.target.value }))
              }
            />
          </Box>
          <TextField
            label="Pays"
            required
            margin="dense"
            value={address.country}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, country: e.target.value }))
            }
          />
          <TextField
            label="Téléphone"
            margin="dense"
            fullWidth
            value={address.phone}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </Card>

        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography fontSize={20} fontWeight={800} mb={2}>
            Paiement par carte bancaire
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid #ddd",
              mb: 2,
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </Box>

          {errorMessage && (
            <Typography color="error" fontSize={14} mb={1}>
              {errorMessage}
            </Typography>
          )}

          {successMessage && (
            <Typography color="success.main" fontSize={14} mb={1}>
              {successMessage}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitting || !stripe || !elements}
          >
            {submitting
              ? "Paiement en cours..."
              : `Payer ${total.toFixed(2)} €`}
          </Button>
        </Card>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Card sx={{ p: 3, borderRadius: 3 }}>
          <Typography fontSize={18} fontWeight={800} mb={2}>
            Résumé de la commande
          </Typography>

          <Typography color="gray" fontSize={14} mb={2}>
            {cartItemsCount} article{cartItemsCount > 1 ? "s" : ""}
          </Typography>

          {cart?.items.map((item) => (
            <Box
              key={item.id}
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography fontSize={14}>
                {item.quantity} × {item.article.title}
              </Typography>
              <Typography fontSize={14}>
                {(item.quantity * item.unitPrice).toFixed(2)} €
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography color="gray">Sous-total (produits)</Typography>
            <Typography fontWeight={700}>{subtotal.toFixed(2)} €</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography color="gray">Livraison</Typography>
            <Typography fontWeight={700}>{shipping.toFixed(2)} €</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight={800}>Total</Typography>
            <Typography fontWeight={900} fontSize={18}>
              {total.toFixed(2)} €
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default function CheckoutPageBuyer() {
  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "1100px", pb: 4 }}>
        <Typography fontSize={28} fontWeight={900} mb={3}>
          Finaliser ma commande
        </Typography>

        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </Container>
    </UserPageLayout>
  );
}
