// hooks/queries/use-remarks.ts
import { useQuery } from '@tanstack/react-query';

interface Remark {
  id: number;
  name: string;
  order: number;
}

interface RemarksResponse {
  success: boolean;
  data: Remark[];
}

async function fetchRemarks(): Promise<Remark[]> {
  const response = await fetch('/api/remarks');
  
  if (!response.ok) {
    throw new Error('Failed to fetch remarks');
  }
  
  const result: RemarksResponse = await response.json();
  return result.data;
}

export function useRemarks() {
  return useQuery({
    queryKey: ['remarks'],
    queryFn: fetchRemarks,
    staleTime: 1000 * 60 * 10, // 10 minutes - remarks don't change often
  });
}

// Helper to transform remarks to select options
export function useRemarksOptions() {
  const { data: remarks, ...rest } = useRemarks();
  
  const options = remarks?.map(remark => ({
    value: remark.id.toString(),
    label: remark.name
  })) || [];
  
  return {
    options,
    remarks,
    ...rest
  };
}