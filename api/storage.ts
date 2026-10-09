import APIClient from "./client";
import type {
  AccessKey,
  ChooseStoragePackagePayload,
  CreateAccessKeyPayload,
  CreatedAccessKey,
  DeleteObjectsPayload,
  ListObjectsQuery,
  ObjectListing,
  ObjectUrlPayload,
  OpenStoragePayload,
  ObjectAccess,
  PresignedUrl,
  SetObjectAccessPayload,
  Storage,
  StoragePackage,
  StorageRegion,
  StorageUsage,
} from "@/core/storageApp";

const projectStorages = (projectId: string) => `/v1/projects/${projectId}/storages`;
const oneStorage = (projectId: string, storageId: string) =>
  `${projectStorages(projectId)}/${storageId}`;

export const ListStorageRegions = () => APIClient.get<StorageRegion[]>("/v1/storage/regions");

export const ListStoragePackages = () =>
  APIClient.get<StoragePackage[]>("/v1/storage/packages");

export const ListStorages = (projectId: string) =>
  APIClient.get<Storage[]>(projectStorages(projectId));

/** Synchronous: the Storage answered is usable at once. */
export const OpenStorage = (projectId: string, payload: OpenStoragePayload) =>
  APIClient.post<Storage>(projectStorages(projectId), payload);

export const GetStorage = (projectId: string, storageId: string) =>
  APIClient.get<Storage>(oneStorage(projectId, storageId));

/** The Bucket name is repeated so that nothing is deleted by a slip (409 when it differs). */
export const DeleteStorage = (projectId: string, storageId: string, bucketName: string) =>
  APIClient.delete<void>(oneStorage(projectId, storageId), { params: { bucketName } });

/** Larger at once, smaller next Period, the current code again undoes a schedule. */
export const ChooseStoragePackage = (
  projectId: string,
  storageId: string,
  payload: ChooseStoragePackagePayload
) => APIClient.put<Storage>(`${oneStorage(projectId, storageId)}/package`, payload);

export const ListAccessKeys = (projectId: string, storageId: string) =>
  APIClient.get<AccessKey[]>(`${oneStorage(projectId, storageId)}/access-keys`);

/** The answer carries the secret key, the only time it is shown. */
export const CreateAccessKey = (
  projectId: string,
  storageId: string,
  payload: CreateAccessKeyPayload
) =>
  APIClient.post<CreatedAccessKey>(`${oneStorage(projectId, storageId)}/access-keys`, payload);

export const RevokeAccessKey = (projectId: string, storageId: string, accessKeyId: string) =>
  APIClient.delete<void>(`${oneStorage(projectId, storageId)}/access-keys/${accessKeyId}`);

export const ListObjects = (
  projectId: string,
  storageId: string,
  query: ListObjectsQuery = {}
) =>
  APIClient.get<ObjectListing>(`${oneStorage(projectId, storageId)}/objects`, {
    params: query,
  });

export const DeleteObjects = (
  projectId: string,
  storageId: string,
  payload: DeleteObjectsPayload
) => APIClient.post<void>(`${oneStorage(projectId, storageId)}/objects/delete`, payload);

/** A presigned GET the browser follows; valid for five minutes. */
export const GetDownloadUrl = (
  projectId: string,
  storageId: string,
  payload: ObjectUrlPayload
) =>
  APIClient.post<PresignedUrl>(
    `${oneStorage(projectId, storageId)}/objects/download-url`,
    payload
  );

/** A presigned PUT the browser sends the file to directly, never through Nodera. */
export const GetUploadUrl = (
  projectId: string,
  storageId: string,
  payload: ObjectUrlPayload
) =>
  APIClient.post<PresignedUrl>(
    `${oneStorage(projectId, storageId)}/objects/upload-url`,
    payload
  );

/** Whether anyone may read the object at its URL. */
export const GetObjectAccess = (projectId: string, storageId: string, key: string) =>
  APIClient.get<ObjectAccess>(`${oneStorage(projectId, storageId)}/objects/access`, {
    params: { key },
  });

/** Lets anyone read the object, or takes that back; an upload is always private. */
export const SetObjectAccess = (
  projectId: string,
  storageId: string,
  payload: SetObjectAccessPayload
) =>
  APIClient.put<ObjectAccess>(`${oneStorage(projectId, storageId)}/objects/access`, payload);

/** Adds Nodera's CORS rule back to the bucket after the Team's own rules replaced it. */
export const RestoreBrowserAccess = (projectId: string, storageId: string) =>
  APIClient.put<void>(`${oneStorage(projectId, storageId)}/browser-access`);

export const GetStorageUsage = (projectId: string, storageId: string) =>
  APIClient.get<StorageUsage>(`${oneStorage(projectId, storageId)}/usage`);
