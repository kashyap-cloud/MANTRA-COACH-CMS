import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getContent, deleteContent, ContentItem } from "@/lib/cms-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

const Dashboard = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getContent());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Delete this content?")) {
      deleteContent(id);
      setItems(getContent());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">MantraCoach Academy</h1>
          <Button onClick={() => navigate("/content/new")} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Content
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No content yet. Click "Add Content" to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-card-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.contentType} · {item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.published ? "default" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/content/${item.id}`)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
