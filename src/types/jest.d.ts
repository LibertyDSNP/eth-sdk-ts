export {};
declare global {
  namespace jest {
    interface Matchers<R> {
      transactionRejectsWith(message: string | RegExp): R;
    }
  }
}
