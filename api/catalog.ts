import APIClient from "./client";
import type { Image, Plan, Region } from "@/core/catalog";

export const GetRegions = () => APIClient.get<Region[]>("/v1/catalog/regions");

export const GetPlans = (regionCode: string) =>
  APIClient.get<Plan[]>("/v1/catalog/plans", { params: { region: regionCode } });

export const GetImages = () => APIClient.get<Image[]>("/v1/catalog/images");
