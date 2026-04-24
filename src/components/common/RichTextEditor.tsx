import React, { useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Code,
  Eye,
  Eraser,
  Palette,
} from "lucide-react";
import { Button } from "../ui/button";
import { Box } from "../ui/box";
import { Flex } from "../ui/flex";
import { axios } from "@/configs/axios.config";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing professional newsletter...",
  className,
}) => {
  const [isSourceMode, setIsSourceMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4 shadow-sm",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] p-6 text-foreground leading-relaxed max-w-none",
          className,
        ),
      },
    },
  });

  const toggleSourceMode = useCallback(() => {
    if (editor && isSourceMode) {
      // Switching from Source to Visual: Update editor content from state (which is currently the raw HTML)
      editor.commands.setContent(content);
    }
    setIsSourceMode(!isSourceMode);
  }, [editor, isSourceMode, content]);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading image...");

    try {
      const response = await axios.post("/editor/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success && response.data.url) {
        editor?.commands.setImage({ src: response.data.url });
        toast.success("Image uploaded", { id: toastId });
      } else {
        throw new Error("Failed to get image URL");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload image", {
        id: toastId,
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-9 w-9 p-0 rounded-md transition-all duration-200",
        isActive
          ? "bg-[#1797b9]/20 text-[#1797b9] font-bold cursor-pointer"
          : "text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {children}
    </Button>
  );

  const colors = [
    "#000000",
    "#444444",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#EEEEEE",
    "#FFFFFF",
    "#FF0000",
    "#FF9900",
    "#FFFF00",
    "#00FF00",
    "#00FFFF",
    "#0000FF",
    "#9900FF",
    "#FF00FF",
    "#E67E22",
    "#E74C3C",
    "#3498DB",
    "#2ECC71",
    "#F1C40F",
    "#1797B9",
  ];

  return (
    <Box className="border border-border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col group focus-within:ring-2 focus-within:ring-primary/30 transition-all duration-300">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*"
      />

      {/* Toolbar */}
      <Flex className="border-b border-border p-1 bg-muted/40 flex-wrap gap-0.5 sticky top-0 z-10">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="H1"
        >
          <Heading1 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="H2"
        >
          <Heading2 size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="H3"
        >
          <Heading3 size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <AlignRight size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Align Justify"
        >
          <AlignJustify size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center" />

        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Link"
        >
          <LinkIcon size={18} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Insert Image">
          <ImageIcon size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
        >
          <Minus size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center" />

        {/* Color Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Text Color"
              className="h-9 w-9 p-0 rounded-md text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <Palette size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 z-[9999] pointer-events-auto">
            <p className="text-xs font-medium mb-2 uppercase text-muted-foreground">
              Colors
            </p>
            <Flex className="flex-wrap gap-1 cursor-default">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().setColor(c).run();
                  }}
                  className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().unsetColor().run();
                }}
                className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                title="Clear Color"
              >
                <Eraser size={12} />
              </button>
            </Flex>
          </PopoverContent>
        </Popover>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Clear Formatting"
        >
          <Eraser size={18} />
        </ToolbarButton>

        <Box className="w-px h-6 bg-muted mx-1 self-center ml-auto" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={toggleSourceMode}
          isActive={isSourceMode}
          title={isSourceMode ? "Visual Editor" : "HTML Source"}
        >
          {isSourceMode ? <Eye size={18} /> : <Code size={18} />}
        </ToolbarButton>
      </Flex>

      {/* Bubble Menu for quick formatting */}
      {editor && !isSourceMode && (
        <BubbleMenu
          editor={editor}
          className="flex bg-card shadow-xl border border-border rounded-lg overflow-hidden p-1 gap-0.5"
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            title="Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>
        </BubbleMenu>
      )}

      {/* Editor Content Area */}
      <Box className="flex-grow overflow-y-auto bg-card min-h-[400px]">
        {isSourceMode ? (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm bg-gray-900 text-green-400 focus:outline-none min-h-[400px] resize-none"
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </Box>

      {/* Footer Info */}
      {!isSourceMode && (
        <Flex className="border-t border-border p-2 px-4 justify-between items-center bg-muted/20">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Rich Text Mode
          </p>
          <p className="text-[10px] text-muted-foreground">
            {editor.storage.characterCount?.characters?.() || 0} characters
          </p>
        </Flex>
      )}
      {isSourceMode && (
        <Flex className="border-t border-gray-800 p-2 px-4 justify-between items-center bg-gray-900 text-muted-foreground">
          <p className="text-[10px] uppercase tracking-widest font-bold text-orange-400">
            HTML Source Mode
          </p>
          <p className="text-[10px]">Be careful with manual HTML tags</p>
        </Flex>
      )}
      {/* Editor Styles */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          padding-bottom: 50px;
        }
      `}</style>
    </Box>
  );
};

export default RichTextEditor;
