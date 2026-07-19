import { useRef, useState } from "react";
import { GeneralModal } from "@/components/common/generalmodal";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eraser, PenLine, Loader2 } from "lucide-react";

export interface SignaturePayload {
  signedName: string;
  /** PNG data URL of the drawn signature, if the client drew one. */
  signatureImage?: string;
}

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: SignaturePayload) => void;
  isSubmitting?: boolean;
  proposalTitle: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  proposalTitle,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const [signedName, setSignedName] = useState("");

  const getCanvasContext = () => canvasRef.current?.getContext("2d") ?? null;

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    drawing.current = true;
    hasDrawn.current = true;
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e293b";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    drawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
  };

  const resetAndClose = () => {
    setSignedName("");
    handleClear();
    onClose();
  };

  const handleSubmit = () => {
    if (!signedName.trim()) return;
    const signatureImage = hasDrawn.current ? canvasRef.current?.toDataURL("image/png") : undefined;
    onConfirm({ signedName: signedName.trim(), signatureImage });
  };

  return (
    <GeneralModal open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <Box className="space-y-4">
        <Box>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <PenLine className="w-4 h-4" /> Sign &amp; Approve
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            You're approving "{proposalTitle}". Type your full name to confirm — drawing a signature below is optional.
          </p>
        </Box>

        <Box>
          <label className="text-sm font-medium text-foreground">Full name *</label>
          <Input
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
            placeholder="Type your full legal name"
            autoFocus
          />
        </Box>

        <Box>
          <Flex className="items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-foreground">Signature (optional)</label>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Eraser className="w-3 h-3" /> Clear
            </button>
          </Flex>
          <canvas
            ref={canvasRef}
            width={440}
            height={140}
            className="w-full border border-border rounded-lg bg-white touch-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        </Box>

        <p className="text-[11px] text-muted-foreground/80">
          By clicking "Approve" you confirm you have authority to accept this proposal on behalf of your
          organization. Your name, the time, and your IP address will be recorded as proof of acceptance.
        </p>

        <Flex className="justify-end gap-2 pt-1">
          <Button variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!signedName.trim() || isSubmitting}
            className="bg-[#00A400] hover:bg-green-700 text-white"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
            Approve
          </Button>
        </Flex>
      </Box>
    </GeneralModal>
  );
};
