import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getContent, deleteContent, ContentItem } from "@/lib/cms-data";
import { Plus, Pencil, Trash2, Search, BookOpen } from "lucide-react";

const Dashboard = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getContent());
  }, []);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.contentType.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm("Delete this content?")) {
      deleteContent(id);
      setItems(getContent());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
          <h1 className="text-lg font-semibold text-primary-foreground">
            MantraCoach Academy
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-foreground">Academy Content</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-9 bg-card"
              />
            </div>
            <Button onClick={() => navigate("/content/new")}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Content
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_140px_140px_110px_80px] gap-4 bg-table-header px-5 py-3">
            <span className="text-sm font-semibold text-table-header-foreground">Title</span>
            <span className="text-sm font-semibold text-table-header-foreground">Content Type</span>
            <span className="text-sm font-semibold text-table-header-foreground">Category</span>
            <span className="text-sm font-semibold text-table-header-foreground">Status</span>
            <span className="text-sm font-semibold text-table-header-foreground text-center">Edit</span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground">
              {items.length === 0
                ? 'No content yet. Click "+ Add Content" to get started.'
                : "No results match your search."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_140px_140px_110px_80px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.title}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.contentType}</span>
                  <span className="text-sm text-muted-foreground">{item.category}</span>
                  <div>
                    {item.published ? (
                      <Badge className="bg-success text-success-foreground hover:bg-success/90 border-0">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/content/${item.id}`)}
                    >
                      <Pencil className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Count */}
        <p className="mt-3 text-sm text-muted-foreground">
          {filtered.length} of {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
