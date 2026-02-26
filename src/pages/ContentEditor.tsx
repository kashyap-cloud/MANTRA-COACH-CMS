import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import SearchableSelect from "@/components/SearchableSelect";
import SearchableMultiSelect from "@/components/SearchableMultiSelect";
import { toast } from "sonner";
import {
  ContentItem,
  CONTENT_TYPES,
  CATEGORIES,
  FOCUS_AREAS,
  getContentById,
  saveContent,
} from "@/lib/cms-data";
import { ArrowLeft, BookOpen, Clock, Image as ImageIcon, Share2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const empty: ContentItem = {
  id: "",
  contentType: "",
  title: "",
  category: "",
  focusAreas: [],
  contentLink: "",
  contentBody: "",
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const loadExisting = async () => {
        setLoading(true);
        try {
          const existing = await getContentById(id);
          if (existing) setForm(existing);
          else navigate("/");
        } catch (err) {
          toast.error("Failed to load content details");
        } finally {
          setLoading(false);
        }
      };
      loadExisting();
    }
  }, [id, isNew, navigate]);

  if (loading && !form.title) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background">
        <BrandLogo size="lg" className="mb-6 animate-pulse" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading your content...</p>
      </div>
    );
  }

  const update = (partial: Partial<ContentItem>) => setForm((prev) => ({ ...prev, ...partial }));

  const toggleFocus = (area: string) => {
    update({
      focusAreas: form.focusAreas.includes(area)
        ? form.focusAreas.filter((a) => a !== area)
        : [...form.focusAreas, area],
    });
  };

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await saveContent({ ...form, published: publish });
      toast.success(isNew ? "Content created!" : "Changes saved!");
      navigate("/");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <BrandLogo size="md" />
            <div className="h-6 w-px bg-border mx-2" />
            <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isNew ? "Add Content" : "Edit Content"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={form.published ? "success" : "secondary"} className="px-3 py-1">
              {form.published ? "LIVE" : "DRAFT"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        {/* LEFT — Form */}
        <div className="flex-1 space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
            {/* Content Type */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Content Type</Label>
              <SearchableSelect
                options={CONTENT_TYPES}
                value={form.contentType}
                onChange={(v) => update({ contentType: v })}
                placeholder="Select type"
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Title</Label>
              <Input className="bg-background" value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="Enter content title" />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Category (Topic)</Label>
              <SearchableSelect
                options={CATEGORIES}
                value={form.category}
                onChange={(v) => update({ category: v })}
                placeholder="Select category"
              />
            </div>

            {/* Focus Areas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Focus Areas</Label>
              <SearchableMultiSelect
                options={FOCUS_AREAS}
                value={form.focusAreas}
                onChange={(v) => update({ focusAreas: v })}
                placeholder="Select focus areas"
              />
            </div>

            {/* Content Link */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Content Link</Label>
              <Input className="bg-background" value={form.contentLink} onChange={(e) => update({ contentLink: e.target.value })} placeholder="https://..." />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Thumbnail URL</Label>
              <Input className="bg-background" value={form.thumbnailUrl} onChange={(e) => update({ thumbnailUrl: e.target.value })} placeholder="https://..." />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Duration</Label>
              <Input className="bg-background" value={form.duration} onChange={(e) => update({ duration: e.target.value })} placeholder="e.g. 15 min" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description (Teaser)</Label>
              <Textarea className="bg-background" value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="Brief description of this content..." rows={2} />
            </div>

            {/* Content Body */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Content Body (Article/Markdown)</Label>
              <Textarea className="bg-background font-mono text-sm" value={form.contentBody} onChange={(e) => update({ contentBody: e.target.value })} placeholder="Write your full content here..." rows={10} />
            </div>

            {/* Live Toggle */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Live Status</Label>
                <p className="text-sm text-muted-foreground">Make this content visible to users in the Academy</p>
              </div>
              <Switch
                checked={form.published}
                onCheckedChange={(v) => update({ published: v })}
              />
            </div>

          </div>
        </div>

        {/* RIGHT — Live Preview */}
        <div className="hidden w-[360px] shrink-0 lg:block">
          <div className="sticky top-8">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Live Preview
            </h3>
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted">
                {form.thumbnailUrl ? (
                  <img
                    src={form.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                {form.contentType && (
                  <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground border-0">
                    {form.contentType}
                  </Badge>
                )}
              </div>

              <div className="p-4 space-y-3">
                {/* Title */}
                <h4 className="text-base font-semibold text-foreground leading-tight">
                  {form.title || "Untitled Content"}
                </h4>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {form.category && <span>{form.category}</span>}
                  {form.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {form.duration}
                    </span>
                  )}
                </div>

                {/* Focus areas */}
                {form.focusAreas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.focusAreas.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">
                        {a}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {form.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 border-t border-border bg-card px-6 py-3 shadow-[0_-2px_10px_-3px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/")} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => handleSave(form.published)} disabled={loading} className="px-8 flex gap-2">
            {loading ? "Processing..." : form.published ? "Update & Stay Live" : isNew ? "Create Draft" : "Save Draft"}
          </Button>
          {!form.published && (
            <Button onClick={() => handleSave(true)} disabled={loading} variant="success" className="px-8 flex gap-2">
              <Share2 className="h-4 w-4" /> {isNew ? "Create & Publish" : "Publish Now"}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default ContentEditor;
