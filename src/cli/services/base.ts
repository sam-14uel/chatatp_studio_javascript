/**
 * Generic CRUD service used by every resource-specific service below.
 */
import { APIClient } from "../apiClient";

export class BaseService {
  constructor(
    protected client: APIClient,
    protected collectionPath: string,
    protected detailPath: (id: string | number) => string
  ) {}

  list(params?: Record<string, unknown>): Promise<any> {
    return this.client.get(this.collectionPath, params);
  }

  get(id: string | number): Promise<any> {
    return this.client.get(this.detailPath(id));
  }

  create(payload: Record<string, unknown>): Promise<any> {
    return this.client.post(this.collectionPath, payload);
  }

  update(id: string | number, payload: Record<string, unknown>, partial = true): Promise<any> {
    return partial ? this.client.patch(this.detailPath(id), payload) : this.client.put(this.detailPath(id), payload);
  }

  delete(id: string | number): Promise<any> {
    return this.client.delete(this.detailPath(id));
  }
}
