export interface PowerOffDialogProps {
  open: boolean;
  hostname: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
