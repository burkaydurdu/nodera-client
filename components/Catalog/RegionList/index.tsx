import RegionCard from "@/components/Catalog/RegionCard";
import type { RegionListProps } from "./type";

export default function RegionList({ regions, selectedCode, onSelect }: RegionListProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {regions.map((region) => (
        <RegionCard
          key={region.id}
          region={region}
          active={region.code === selectedCode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
