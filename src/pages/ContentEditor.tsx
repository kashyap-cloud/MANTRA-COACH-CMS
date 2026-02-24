import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ContentItem,
  CONTENT_TYPES,
  CATEGORIES,
  FOCUS_AREAS,
  getContentById,
  saveContent,
} from "@/lib/cms-data";
import { ArrowLeft, Eye } from "lucide-react";

const empty: ContentItem = {
  id: "",
  contentType: "",
  title: "",
  category: "",
  focusAreas: [],
  contentLink: "",
  thumbnailUrl: "",
  duration: "",
  description: "",
  published: false,
  createdAt: "",
  updatedAt: "",
};

const ContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [form, setForm] = useState<ContentItem>({ ...empty, id: crypto.randomUUID() });

  useEffect(() => {
    if (!isNew && id) {
      const existing = getContentById(id);
      if (existing) setForm(existing);
      else navigate("/");
    }
  }, [id, isNew, navigate]);

  const update = (partial: Partial<ContentItem>) => setForm((prev) => ({ ...prev, ...partial }));

  const toggleFocus = (area: string) => {
    update({
      focusAreas: form.focusAreas.includes(area)
        ? form.focusAreas.filter((a) => a !== area)
        : [...form.focusAreas, area],
    });
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    saveContent(form);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">
            {isNew ? "Add Content" : "Edit Content"}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        {/* Content Type */}
        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select value={form.contentType} onValueChange={(v) => update({ contentType: v })}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {CONTENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Content title" />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => update({ category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Focus Areas */}
        <div className="space-y-2">
          <Label>Focus Areas</Label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <Badge
                key={area}
                variant={form.focusAreas.includes(area) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleFocus(area)}
              >
                {area}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Link */}
        <div className="space-y-2">
          <Label>Content Link</Label>
          <Input value={form.contentLink} onChange={(e) => update({ contentLink: e.target.value })} placeholder="https://..." />
        </div>

        {/* Thumbnail URL */}
        <div className="space-y-2">
          <Label>Thumbnail URL</Label>
          <Input value={form.thumbnailUrl} onChange={(e) => update({ thumbnailUrl: e.target.value })} placeholder="https://..." />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duration</Label>
          <Input value={form.duration} onChange={(e) => update({ duration: e.target.value })} placeholder="e.g. 15 min" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Brief description..." rows={4} />
        </div>

        {/* Published */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <Label className="cursor-pointer">Published</Label>
          <Switch checked={form.published} onCheckedChange={(v) => update({ published: v })} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} className="flex-1">Save</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Eye className="mr-1 h-4 w-4" /> Preview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Content Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {form.thumbnailUrl && (
                  <img src={form.thumbnailUrl} alt="" className="w-full rounded-md object-cover" />
                )}
                <div>
                  <Badge variant="secondary" className="mb-2">{form.contentType || "Type"}</Badge>
                  <h3 className="text-lg font-semibold text-foreground">{form.title || "Untitled"}</h3>
                  <p className="text-sm text-muted-foreground">{form.category} · {form.duration}</p>
                </div>
                {form.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {form.focusAreas.map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{form.description || "No description"}</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default ContentEditor;
