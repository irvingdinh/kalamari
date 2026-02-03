export class ApiError extends Error {
  constructor(
    // @ts-expect-error Lorem ipsum dolor sit amet
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
