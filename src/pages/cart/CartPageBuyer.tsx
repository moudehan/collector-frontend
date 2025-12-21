import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import AnimatedButton from "../../components/Button";
import UserPageLayout from "../../layout/UserPageLayout";

import { useCart } from "../../contexte/cart/useCart";
import type { CartItem } from "../../types/cart.type";

export default function CartPageBuyer() {
  const navigate = useNavigate();

  const { cart, loading, updateItemQuantity, removeItem, clearCart } =
    useCart();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const hasItems = !!cart && cart.items.length > 0;

  const totals = useMemo(() => {
    if (!cart) {
      return {
        itemsCount: 0,
        subtotal: 0,
        shipping: 0,
        total: 0,
      };
    }

    const itemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    const subtotal = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    const shipping = cart.items.reduce((acc, item) => {
      const raw = item.article.shipping_cost;

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
    }, 0);

    const total = subtotal + shipping;

    return { itemsCount, subtotal, shipping, total };
  }, [cart]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: cart?.currency || "EUR",
    }).format(value);
  }

  async function handleChangeQuantity(item: CartItem, newQty: number) {
    const maxStock =
      typeof item.article.quantity === "number" && item.article.quantity > 0
        ? item.article.quantity
        : 1;

    const clamped = Math.max(1, Math.min(newQty, maxStock));

    if (clamped === item.quantity) return;

    try {
      setUpdatingItemId(item.id);
      await updateItemQuantity(item.id, clamped);
    } catch (e) {
      console.error("Erreur maj quantité :", e);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemoveItem(item: CartItem) {
    try {
      setUpdatingItemId(item.id);
      await removeItem(item.id);
    } catch (e) {
      console.error("Erreur suppression article panier :", e);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleClearCartClick() {
    try {
      setClearing(true);
      await clearCart();
    } catch (e) {
      console.error("Erreur vidage panier :", e);
    } finally {
      setClearing(false);
    }
  }

  function handleCheckout() {
    navigate("/checkout");
  }

  if (loading && !cart) {
    return (
      <UserPageLayout>
        <Container sx={{ maxWidth: "1100px", py: 4 }}>
          <Typography fontSize={22} fontWeight={800}>
            Chargement du panier...
          </Typography>
        </Container>
      </UserPageLayout>
    );
  }

  return (
    <UserPageLayout>
      <Container sx={{ maxWidth: "1100px", pb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Typography fontSize={18} fontWeight={700} ml={1}>
            Retour
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box>
            <Typography fontSize={32} fontWeight={900}>
              Mon panier
            </Typography>
            <Typography color="gray" fontSize={14}>
              {totals.itemsCount} article
              {totals.itemsCount > 1 ? "s" : ""} dans votre panier
            </Typography>
          </Box>

          {hasItems && (
            <Button
              variant="text"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleClearCartClick}
              disabled={clearing}
            >
              Vider le panier
            </Button>
          )}
        </Box>

        {!hasItems ? (
          <Card
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              mt: 2,
            }}
          >
            <Typography fontSize={20} fontWeight={700} mb={1}>
              Votre panier est vide
            </Typography>
            <Typography color="gray" fontSize={14} mb={3}>
              Parcourez les annonces et ajoutez vos articles préférés au panier.
            </Typography>

            <AnimatedButton
              label="Continuer mes achats"
              startIcon={<ShoppingCartIcon />}
              onClick={() => navigate("/home")}
              width="260px"
            />
          </Card>
        ) : (
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            <Box sx={{ flex: 2 }}>
              {cart.items.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 2,
                      overflow: "hidden",
                      flexShrink: 0,
                      bgcolor: "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.article.images?.[0]?.url ? (
                      <Box
                        component="img"
                        src={item.article.images[0].url}
                        alt={item.article.title}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography fontSize={12} color="gray">
                        Pas d&apos;image
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} fontSize={16} sx={{ mb: 0.5 }}>
                      {item.article.title}
                    </Typography>

                    {item.article.shop && (
                      <Typography color="gray" fontSize={13} mb={0.5}>
                        Vendu par {item.article.shop.name}
                      </Typography>
                    )}

                    <Typography fontWeight={700} fontSize={15} mb={0.5}>
                      {formatPrice(item.unitPrice)}
                    </Typography>

                    <Typography color="gray" fontSize={12} mb={0.5}>
                      Frais de livraison : {item.article.shipping_cost ?? 0}
                    </Typography>

                    <Typography color="gray" fontSize={12}>
                      Livraison estimée sous 3 à 5 jours ouvrés
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 999,
                        border: "1px solid #ddd",
                        overflow: "hidden",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleChangeQuantity(item, item.quantity - 1)
                        }
                        disabled={
                          updatingItemId === item.id || item.quantity <= 1
                        }
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        fontWeight={700}
                        sx={{ minWidth: 32, textAlign: "center" }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleChangeQuantity(item, item.quantity + 1)
                        }
                        disabled={
                          updatingItemId === item.id ||
                          (typeof item.article.quantity === "number" &&
                            item.quantity >= item.article.quantity)
                        }
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography fontWeight={700} fontSize={15}>
                      {formatPrice(item.quantity * item.unitPrice)}
                    </Typography>

                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineIcon />}
                      onClick={() => handleRemoveItem(item)}
                      disabled={updatingItemId === item.id}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </Card>
              ))}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card sx={{ p: 3, borderRadius: 3 }}>
                <Typography fontSize={18} fontWeight={800} mb={2}>
                  Résumé de la commande
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="gray">Sous-total (produits)</Typography>
                  <Typography fontWeight={700}>
                    {formatPrice(totals.subtotal)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="gray">Livraison</Typography>
                  <Typography fontWeight={700}>
                    {formatPrice(totals.shipping)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={800}>Total</Typography>
                  <Typography fontWeight={900} fontSize={20}>
                    {formatPrice(totals.total)}
                  </Typography>
                </Box>

                <AnimatedButton
                  label="Passer à la commande"
                  startIcon={<ShoppingCartIcon />}
                  width="100%"
                  onClick={handleCheckout}
                />

                <Button
                  sx={{ mt: 1.5 }}
                  fullWidth
                  variant="text"
                  onClick={() => navigate("/")}
                >
                  Continuer mes achats
                </Button>
              </Card>
            </Box>
          </Box>
        )}
      </Container>
    </UserPageLayout>
  );
}
