import { useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  videoId: string;
  title: string;
  onClose: () => void;
}

export const VideoModal = ({ isOpen, videoId, title, onClose }: VideoModalProps) => {
  const returnFocus = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="gap-0 overflow-hidden border-0 bg-white p-0 text-[#172b34] sm:max-w-4xl motion-reduce:animate-none"
        onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }}
      >
        <div className="px-5 py-4 pe-12">
          <DialogTitle className="text-sm font-semibold">{title}</DialogTitle>
          <DialogDescription className="sr-only">Watch the selected Flowlio walkthrough.</DialogDescription>
        </div>
        {isOpen && <iframe
          className="aspect-video w-full border-0 bg-black"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />}
      </DialogContent>
    </Dialog>
  );
};
