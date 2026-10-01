export interface DeleteDropletDialogProps {
  open: boolean;
  hostname: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
