import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AnalyzeRequest } from "@shared/routes";

export function useAnalyzeScene() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AnalyzeRequest) => {
      const res = await fetch(api.analyze.path, {
        method: api.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Failed to analyze scene");
      }
      
      return api.analyze.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate snapshots list so history updates immediately
      queryClient.invalidateQueries({ queryKey: [api.snapshots.list.path] });
    }
  });
}

export function useSnapshots() {
  return useQuery({
    queryKey: [api.snapshots.list.path],
    queryFn: async () => {
      const res = await fetch(api.snapshots.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.snapshots.list.responses[200].parse(await res.json());
    }
  });
}
