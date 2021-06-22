export const checkNumberOfFunctionCalls = async (
  mockFn: jest.Mock,
  timeOutSeconds: number,
  times: number
): Promise<boolean> => {
  for (let i = 0; i < timeOutSeconds && mockFn.mock.calls.length < times; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return mockFn.mock.calls.length >= times;
};
