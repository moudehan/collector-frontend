import {
  Box,
  Button,
  Divider,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

export type Item = {
  id: string;
  title: string;
  subtitle?: string;
  is_read: boolean;
  article_id: string;
  type: string;
};

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: Item[];
  emptyText: string;
  onItemClick?: (item: Item) => void;
  onMarkAllRead?: () => void;
  onMarkAllUnread?: () => void;
  onViewAll?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export default function DropdownList({
  anchorEl,
  open,
  onClose,
  items,
  emptyText,
  onItemClick,
  onMarkAllRead,
  onMarkAllUnread,
  onViewAll,
  onLoadMore,
  hasMore,
}: Props) {
  const hasUnread = items.some((i) => !i.is_read);

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          width: 380,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#f4f6fb",
        }}
      >
        <Typography fontWeight={800}>Notifications</Typography>

        <Box display="flex" gap={1}>
          <Button
            size="small"
            onClick={onViewAll}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Tout voir
          </Button>

          <Button
            size="small"
            onClick={() => {
              if (hasUnread) onMarkAllRead?.();
              else onMarkAllUnread?.();
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {hasUnread ? "Tout lire" : "Tout relire"}
          </Button>
        </Box>
      </Box>

      <Divider />

      {items.length === 0 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">{emptyText}</Typography>
        </Box>
      )}

      <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
        {items.map((item, index) => (
          <Box key={item.id}>
            <MenuItem
              onClick={() => onItemClick?.(item)}
              sx={{
                alignItems: "flex-start",
                gap: 1.5,
                backgroundColor: item.is_read ? "#fff" : "#eef4ff",
                transition: "0.2s",
                "&:hover": {
                  backgroundColor: item.is_read ? "#f6f6f6" : "#dbe7fd",
                },
              }}
            >
              {!item.is_read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#ff4f74",
                    mt: 1,
                    flexShrink: 0,
                  }}
                />
              )}

              <ListItemText
                primary={
                  <Typography fontWeight={700} fontSize={14}>
                    {item.title}
                  </Typography>
                }
                secondary={
                  item.subtitle && (
                    <Typography fontSize={12} color="gray">
                      {item.subtitle}
                    </Typography>
                  )
                }
              />
            </MenuItem>

            {index < items.length - 1 && <Divider />}
          </Box>
        ))}
      </Box>

      {hasMore && (
        <>
          <Divider />
          <MenuItem
            onClick={onLoadMore}
            sx={{
              justifyContent: "center",
              fontWeight: 700,
              color: "#1e4fff",
            }}
          >
            Voir plus
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
