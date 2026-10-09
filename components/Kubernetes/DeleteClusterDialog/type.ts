export interface DeleteClusterDialogProps {
  open: boolean;
  name: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
