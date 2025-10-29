// Minimal background sync stub for AC-2

/**
 * Trigger background sync on reconnect. For AC-2 Green we simply resolve.
 * Future implementation can enqueue pending operations and process them.
 */
export async function triggerBackgroundSync(): Promise<void> {
  // no-op for now; considered successful
}
