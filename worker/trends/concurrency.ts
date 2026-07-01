export class ConcurrencyLimiter {
  private running = 0;

  private readonly queue: Array<() => void> = [];

  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  private acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  private release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const pool = new ConcurrencyLimiter(limit);
  return Promise.all(items.map((item) => pool.run(() => fn(item))));
}
